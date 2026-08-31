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
  const files: string[] = [];
  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    files.push(path.join(dir, '.env'));
    files.push(path.join(dir, '.env.local'));
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return files;
}

/** Next ne charge que web/.env. Les secrets admin sont à la racine du repo. */
export function loadRootEnv() {
  const merged: Record<string, string> = {};
  for (const file of envCandidates()) {
    Object.assign(merged, parseEnvFile(file));
  }
  for (const key of ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'DATABASE_URL', 'CATALOG_API_SECRET']) {
    const value = merged[key];
    if (value) process.env[key] = value;
  }
}

export function adminConfigured() {
  loadRootEnv();
  return Boolean((process.env.ADMIN_EMAIL || '').trim() && (process.env.ADMIN_PASSWORD || '').trim());
}
