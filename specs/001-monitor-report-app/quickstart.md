# Phase 1 — Quickstart (Dev)

**Feature**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)
**Date**: 2026-02-05

## Prérequis

- Docker + Docker Compose
- Node.js LTS (recommandé)

## Démarrage (dev)

Objectif: 1 commande pour lancer frontend + backend + DB.

1) Démarrer l’environnement:

- `docker compose up --build`

2) Ouvrir l’app:

- Frontend: `http://localhost:3000`
- API: `http://localhost:3001`

## Variables d’environnement (proposées)

Backend:
- `PORT` (défaut 3001)
- `MONGODB_URI` (ex. `mongodb://mongo:27017/monitor_reports`)

Frontend:
- `VITE_API_BASE_URL` (ex. `http://localhost:3001`)

## Tests

- Backend: `npm test`
- Frontend: `npm test`

## Notes de fonctionnement

- Sans authentification: le frontend génère un `workspaceId` et l’envoie dans l’en-tête `X-Workspace-Id`.
- Le rendu texte du rapport est généré via l’endpoint `/api/reports/{id}/render`.
- L’envoi email est assisté: `/api/reports/{id}/email/prepare` + ouverture `mailto:` côté frontend.
