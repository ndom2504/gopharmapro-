# PharmaMarket Mobile - MVP

Prototype client Expo/React Native issu du cahier des charges. Donnees locales de demonstration; aucune vente reelle ni traitement d'ordonnance.

## Demarrage

1. Installer Node.js LTS.
2. Copier `.env.example` vers `.env`.
3. Executer `npm install`.
4. Executer `npx expo start`.
5. Ouvrir avec Expo Go ou un simulateur Android/iOS.

## Inclus

- Accueil, categories et pharmacies proches
- Recherche, filtres et tri
- Fiche produit et comparaison des pharmacies
- Panier mono-pharmacie
- Blocage du paiement avant validation d'une ordonnance
- Commandes, notifications et profil

## Prochaine phase

Brancher l'API, PostgreSQL/Prisma, l'authentification, le stockage prive des ordonnances et un prestataire de paiement conforme au pays de lancement.
