import { existsSync, readFileSync } from 'fs';
import path from 'path';

function applyFile(file: string) {
  if (!existsSync(file)) return;
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
    const current = process.env[key];
    if (current == null || current === '') process.env[key] = value;
  }
}

/** Next ne charge que web/.env. Les secrets admin restent souvent à la racine. */
export function loadRootEnv() {
  const webDir = process.cwd();
  const rootDir = path.join(webDir, '..');
  applyFile(path.join(webDir, '.env'));
  applyFile(path.join(webDir, '.env.local'));
  applyFile(path.join(rootDir, '.env'));
  applyFile(path.join(rootDir, '.env.local'));
}
