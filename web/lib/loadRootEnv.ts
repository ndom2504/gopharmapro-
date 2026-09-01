import { existsSync, readFileSync } from 'fs';
import path from 'path';

function parseEnvFile(file: string) {
  const out: Record<string, string> = {};
  if (!existsSync(file)) return out;
  for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function envCandidates() {
  const roots = new Set<string>();
  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    roots.add(dir);
    roots.add(path.join(dir, 'web'));
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  const files: string[] = [];
  for (const root of roots) {
    files.push(path.join(root, '.env'));
    files.push(path.join(root, '.env.local'));
  }
  return files;
}

/** Next ne charge que web/.env. Les secrets admin sont à la racine du repo. */
export function loadRootEnv() {
  const merged: Record<string, string> = {};
  for (const file of envCandidates()) {
    const parsed = parseEnvFile(file);
    for (const [key, value] of Object.entries(parsed)) {
      if (value) merged[key] = value;
    }
  }
  for (const key of ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'DATABASE_URL', 'CATALOG_API_SECRET', 'BLOB_READ_WRITE_TOKEN', 'ORDER_DELIVERY_FEE']) {
    const value = merged[key];
    if (value) process.env[key] = value;
  }
}

export function adminConfigured() {
  loadRootEnv();
  return Boolean((process.env.ADMIN_EMAIL || '').trim() && (process.env.ADMIN_PASSWORD || '').trim());
}
