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

## Ordonnances

`requiresPrescription` est informatif. Le client pourra plus tard « Soumettre une ordonnance ». Le paiement reste soumis aux règles existantes du prototype (`cartRxGate`), pas à ce champ seul.

## Multi-pays

Ajouter un pays = une ligne `Country` + catégories. Pas de `if (country === "Gabon")` dans les règles générales.

Le seed crée `GA`, `BJ`, `CM` (actifs), les catégories commerciales pour les trois pays, et les produits démo **uniquement pour le Gabon**, avec `ProductCountry.status = UNKNOWN` et `verified = false`.
