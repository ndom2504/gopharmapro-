/** Neon Postgres. Empty until DATABASE_URL is set in Vercel. */
export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}
