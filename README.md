# Go Pharma Pro

Marketplace pharmacies au Gabon : application mobile Expo et site [gopharmapro.com](https://gopharmapro.com).

## Application mobile

1. Copier `.env.example` vers `.env`.
2. `npm install --legacy-peer-deps`
3. `npx expo start`

Package Android : `ga.pharmamarket.app`

## Site web (Vercel + Neon)

Dossier `web/`. Dans Vercel, **Root Directory = `web`**.

Variables Vercel :

- `NEXT_PUBLIC_SITE_URL=https://gopharmapro.com`
- `NEXT_PUBLIC_APP_NAME=Go Pharma Pro`
- `DATABASE_URL` (Neon, plus tard)

Domaine : ajouter `gopharmapro.com` et `www` dans Vercel → Project → Domains, puis les DNS chez le registrar (A/CNAME indiqués par Vercel).

En local :

```bash
cd web
cp .env.example .env.local
npm run dev
```
