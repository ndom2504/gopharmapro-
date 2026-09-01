# Catalogue central Gopharmapro

Le catalogue sépare trois couches :

1. **Produit** — fiche médicale / commerciale Gopharmapro (`Product`)
2. **Réglementation pays** — statut par pays, jamais déduit (`ProductCountry`)
3. **Offre pharmacie** — prix, stock, livraison (`PharmacyProduct`)

Les pharmacies ne créent pas de fiches. Elles sélectionnent un produit existant.

Le site mock (`GET /api/v1/catalog`) reste en place. Les routes ci-dessous sont le catalogue Neon.

## Prérequis

Dans `web/` (chargé aussi depuis le `.env` racine via `next.config.ts`) :

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
CATALOG_API_SECRET=  # optionnel, sinon ADMIN_PASSWORD sert à signer le cookie pharmacie
BLOB_READ_WRITE_TOKEN=  # Vercel Blob — token lecture/écriture, jamais exposé au frontend
ORDER_DELIVERY_FEE=0  # frais de livraison fixes (XAF), 0 par défaut — pas encore de calcul réel
```

`BLOB_READ_WRITE_TOKEN` n’est **pas encore présent** dans les `.env` locaux. À ajouter dans `web/.env.local` et dans les variables Vercel (projet `web`). Sans ce token, l’upload d’image répond `503` ; la création de produit sans image reste possible.

### POST `/api/v1/admin/catalog/products/upload-image` (admin)

`multipart/form-data` champ `file`.

- Formats : `image/jpeg`, `image/png`, `image/webp`
- Taille max : 5 Mo
- Cookie `gpp_admin` obligatoire
- Stockage : Vercel Blob (public). Prisma ne conserve que `Product.imageUrl` (+ `imageAlt`)

```json
{ "ok": true, "url": "https://xxxxx.public.blob.vercel-storage.com/catalog/products/..." }
```

Commandes (dossier `web/`) :

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npx tsx scripts/catalog-check.ts
```

Sans `DATABASE_URL`, le site continue de fonctionner. Les routes `/api/v1/catalog/countries` (etc.) répondent `503`.

## Modèles

- `Country` — code ISO (`GA`, `CM`, `BJ`), devise
- `Category` — appartient à un pays (structure commerciale, pas une classification officielle)
- `Product` — fiche catalogue (`requiresPrescription` administrable)
- `ProductCountry` — `PENDING | PENDING_REVIEW | ACTIVE | RESTRICTED | INACTIVE | UNKNOWN`, `active`, `verified`, référence réglementaire
- `Pharmacy` — `accountId` relie le compte démo web (`ph-centre`)
- `PharmacyProduct` — unique `(pharmacyId, productId)`

Un produit n’est jamais considéré autorisé dans un pays tant que `ProductCountry.verified` n’est pas vrai.

## Authentification

| Surface | Protection |
| --- | --- |
| Consultation catalogue | publique |
| Admin `/api/v1/admin/catalog/*` | cookie `gpp_admin` (console existante) |
| Pharmacie `/api/v1/pharmacies/*` | cookie `gpp_pharmacy` après `POST /api/v1/pharmacies/session` |

`POST /api/v1/pharmacies/session` : `{ "accountId": "ph-centre", "email": "centre@pharma.ga" }`

## Endpoints publics

### GET `/api/v1/catalog/countries`

```json
{ "countries": [{ "id": "...", "code": "GA", "name": "Gabon", "currency": "XAF", "currencySymbol": "FCFA" }] }
```

### GET `/api/v1/catalog/categories?country=GA`

### GET `/api/v1/catalog/products?country=GA&search=paracetamol&page=1&limit=20`

Paramètres : `country`, `category` (slug ou id), `search`, `prescriptionRequired`, `active`, `page`, `limit`.

La recherche Prisma porte sur `name`, `genericName` et `brandName`.

### POST `/api/v1/catalog/products` (admin)

Crée une fiche + `ProductCountry` pour le pays choisi. Statut initial : `PENDING_REVIEW` (« À vérifier »). Ne signifie pas que le produit est autorisé.

### PUT `/api/v1/catalog/products/[id]` (admin)

### DELETE `/api/v1/catalog/products/[id]` (admin)

Désactivation logique (`active=false`). Aucune suppression physique.

### GET `/api/v1/catalog/products/search?q=paracetamol&country=GA`

### GET `/api/v1/catalog/products/[id]?country=GA`

Le détail inclut `regulatory` (`status`, `verified`) et `prescriptionHint` si une ordonnance peut être requise. **Aucun blocage de vente** n’est appliqué ici.

### GET `/api/v1/catalog/products/[id]/pharmacies`

Paramètres : `country`, `city`, `latitude`, `longitude`, `radius`, `delivery`, `pickup`, `page`, `limit`.

Tri : disponibilité, puis distance, puis prix.

```json
{
  "product": { "id": "...", "name": "Paracétamol 500 mg comprimé", "genericName": "Paracétamol" },
  "offers": [
    {
      "pharmacy": { "id": "...", "name": "Pharmacie du Centre", "city": "Libreville" },
      "price": 1500,
      "currency": "XAF",
      "stockQuantity": 20,
      "available": true,
      "deliveryAvailable": true,
      "pickupAvailable": true,
      "distanceKm": 1.4
    }
  ]
}
```

## Endpoints pharmacie

### GET `/api/v1/pharmacies`

### POST `/api/v1/pharmacies` (admin)

### GET `/api/v1/pharmacies/[id]`

Le catalogue d’offres n’est renvoyé qu’à la pharmacie propriétaire ou à un administrateur.

### POST `/api/v1/pharmacies/[pharmacyId]/products`

```json
{ "productId": "...", "price": 1500, "stockQuantity": 10, "available": true, "deliveryAvailable": true, "pickupAvailable": true }
```

Refusé : prix/stock négatifs, produit inactif, produit d’un autre pays, doublon.

### PUT `/api/v1/pharmacies/[pharmacyId]/products/[productId]`

### PATCH `/api/v1/pharmacies/[pharmacyId]/products/[productId]`

### DELETE `/api/v1/pharmacies/[pharmacyId]/products/[productId]`

### GET `/api/v1/pharmacies/[pharmacyId]/products`

`pharmacyId` accepte l’id Prisma ou `accountId` (`ph-centre`).

## Endpoints admin

- `POST /api/v1/admin/catalog/products`
- `PATCH /api/v1/admin/catalog/products/[id]`
- `POST /api/v1/admin/catalog/categories`
- `PATCH /api/v1/admin/catalog/categories/[id]`
- `POST /api/v1/admin/catalog/product-country`

Exemple statut pays :

```json
{
  "productId": "...",
  "countryId": "...",
  "status": "PENDING",
  "requiresPrescription": false,
  "regulatoryReference": null,
  "regulatoryNote": "À vérifier",
  "verified": false
}
```

## Parcours client

- `GET /api/v1/client/products/search?country=GA&search=paracetamol`
- `GET /api/v1/client/cities?country=GA`
- `GET /api/v1/client/offers/[pharmacyId]/[productId]`
- `POST /api/v1/client/session`
- `POST /api/v1/prescriptions` · `GET` · `POST .../submit` · `POST .../approve` · `POST .../reject`

Recherche : pharmacies actives **et vérifiées**, offres disponibles avec stock, produit actif dans le pays. Distance Haversine si `latitude`/`longitude` (jamais stockés depuis le GPS).

## Panier et commandes (étape 4)

Le mock `/panier` (localStorage) reste en place. Le parcours catalogue Neon utilise un panier Prisma lié à `CustomerProfile`.

Prix : toujours recalculés depuis `PharmacyProduct.price` côté serveur. Le frontend ne peut pas imposer un prix. Les `OrderItem` conservent un snapshot (nom, dosage, forme, prix).

Le stock est **vérifié** à l’ajout et à la création de commande, mais **n’est pas décrémenté** tant que le paiement n’est pas confirmé.

Une commande par pharmacie. Numéro unique `GP-2026-000001`.

`PrescriptionStatus` existant (`PrescriptionRequest`) n’a pas été modifié. Les ordonnances de commande utilisent `OrderPrescriptionStatus` : `NOT_REQUIRED | PENDING | SUBMITTED | APPROVED | REJECTED`.

### Panier (cookie `gpp_client`)

- `GET /api/v1/cart`
- `POST /api/v1/cart/items` `{ "pharmacyProductId", "quantity" }`
- `PUT /api/v1/cart/items/[id]` `{ "quantity" }`
- `DELETE /api/v1/cart/items/[id]`
- `DELETE /api/v1/cart`

Refus : offre absente, pharmacie inactive, produit inactif/indisponible, `Quantité disponible insuffisante.`

### Commandes client

- `POST /api/v1/orders` — crée une commande par pharmacie, vide le panier
- `GET /api/v1/orders` — ses commandes (admin : toutes)
- `GET /api/v1/orders/[id]`
- `POST /api/v1/orders/[id]/cancel`
- `POST /api/v1/orders/[id]/prescription` — `multipart` champ `file` (PDF/JPEG/PNG/WEBP, 5 Mo, cookie client, Vercel Blob)

Si un article exige une ordonnance : `PENDING_PRESCRIPTION`. Sinon : `READY_FOR_PAYMENT` (« Votre commande est prête pour le paiement. »). Pas de Stripe / Airtel / Moov / GeniusPay à cette étape.

### Commandes pharmacie (cookie `gpp_pharmacy`)

- `GET /api/v1/pharmacy/orders`
- `GET /api/v1/pharmacy/orders/[id]`
- `POST /api/v1/pharmacy/orders/[id]/approve-prescription` → `READY_FOR_PAYMENT`
- `POST /api/v1/pharmacy/orders/[id]/reject-prescription` `{ "note" }` obligatoire → `REJECTED`

Admin : `GET /api/v1/admin/orders`.

Pages : `/dashboard/client/cart`, `/dashboard/client/checkout`, `/dashboard/client/orders`, `/dashboard/pharmacy/orders`.

## Ordonnances

`requiresPrescription` est informatif. Le client pourra plus tard « Soumettre une ordonnance ». Le paiement reste soumis aux règles existantes du prototype (`cartRxGate`), pas à ce champ seul.

## Multi-pays

Ajouter un pays = une ligne `Country` + catégories. Pas de `if (country === "Gabon")` dans les règles générales.

Le seed crée `GA`, `BJ`, `CM` (actifs), les catégories commerciales pour les trois pays, et les produits démo **uniquement pour le Gabon**, avec `ProductCountry.status = UNKNOWN` et `verified = false`.
