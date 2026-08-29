import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import path from 'path';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());
loadEnvConfig(path.join(process.cwd(), '..'));

export const ADMIN_COOKIE = 'gpp_admin';

function expectedEmail() {
  return (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
}

function adminPassword() {
  return process.env.ADMIN_PASSWORD || '';
}

export function adminToken() {
  return createHmac('sha256', adminPassword() || 'unset').update('gopharmapro-admin-v1').digest('hex');
}

function same(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function credentialsOk(email: string, password: string) {
  const expected = expectedEmail();
  const secret = adminPassword();
  if (!expected || !secret) return false;
  const mail = email.trim().toLowerCase();
  if (!mail || !password) return false;
  if (!same(mail, expected)) return false;
  return same(password, secret);
}

export async function isAdminSession() {
  const jar = await cookies();
  const value = jar.get(ADMIN_COOKIE)?.value || '';
  if (!value || !adminPassword()) return false;
  return same(value, adminToken());
}

export async function requireAdmin() {
  if (!(await isAdminSession())) redirect('/admin');
}

export async function setAdminCookie() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}
