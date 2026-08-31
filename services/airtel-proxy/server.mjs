import http from 'node:http';

const port = Number(process.env.PORT || 8080);
const secret = process.env.PAY_PROXY_SECRET || '';

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function authorized(req) {
  if (!secret) return true;
  return req.headers.authorization === `Bearer ${secret}`;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    json(res, 200, { ok: true, service: 'gopharmapro-airtel' });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/egress') {
    if (!authorized(req)) {
      json(res, 401, { ok: false, error: 'unauthorized' });
      return;
    }
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const data = await ipRes.json();
      json(res, 200, { ok: true, egress: data.ip || null });
    } catch {
      json(res, 502, { ok: false, error: 'egress-lookup-failed' });
    }
    return;
  }

  json(res, 404, { ok: false, error: 'not-found' });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`gopharmapro-airtel listening on ${port}`);
});
