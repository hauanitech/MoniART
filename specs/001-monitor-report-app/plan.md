# Implementation Plan: Monitor Report App

**Branch**: `001-monitor-report-app` | **Date**: 2026-02-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-monitor-report-app/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Construire une app web sans authentification pour rédiger 2 types de rapports (Salles en B / BU) via un formulaire guidé, générer un rendu texte, permettre la copie (complet / par section), stocker un historique, et préparer l’envoi par email.

Approche: frontend web responsive (Tailwind) + API backend + persistance MongoDB, avec un “workspaceId” côté client pour scoper les données sans login. Contrat API documenté (OpenAPI) et rendu texte généré par le backend.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (Node.js LTS)  
**Primary Dependencies**: ReactJS (frontend), ExpressJS (backend), Tailwind CSS (UI)  
**Storage**: MongoDB  
**Testing**: Tests unitaires + tests d’API (framework de test JS/TS)  
**Target Platform**: Web (navigateur moderne) + serveur Node.js  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: MVP (latence perçue faible, rendu instantané sur des rapports “humains”)  
**Constraints**: Sans authentification; UI responsive; dev reproductible via Docker Compose  
**Scale/Scope**: Petit périmètre (1 équipe / 1 usage interne), historique de rapports modéré

**Research Notes**: voir [research.md](./research.md)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Statut: **PASS (avec note)**

- Le fichier de constitution [.specify/memory/constitution.md](../../.specify/memory/constitution.md) est un template non renseigné (placeholders), donc aucune règle spécifique de projet n’est applicable.
- Gates appliqués par défaut pour ce feature:
  - Contrat API documenté (OpenAPI) ✅ ([contracts/openapi.yaml](./contracts/openapi.yaml))
  - Décisions de clarification consignées ✅ ([research.md](./research.md))
  - Modèle de données défini ✅ ([data-model.md](./data-model.md))
  - Quickstart dev défini ✅ ([quickstart.md](./quickstart.md))

## Project Structure

### Documentation (this feature)

```text
specs/001-monitor-report-app/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
backend/
├── src/
│   ├── api/
│   ├── models/
│   ├── services/
│   └── templates/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── styles/
└── tests/

docker-compose.yml
```

**Structure Decision**: Application web séparée en deux projets (frontend + backend) pour garder le serveur stateless et permettre un déploiement indépendant. MongoDB est utilisé par le backend.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|

No constitution violations identified for this feature.

## Phase 0 Output

- Research consolidé: [research.md](./research.md)

## Phase 1 Output

- Modèle de données: [data-model.md](./data-model.md)
- Contrat API: [contracts/openapi.yaml](./contracts/openapi.yaml)
- Quickstart dev: [quickstart.md](./quickstart.md)

## Phase 2 — Implementation Plan (high level)

1) **Backend API**
  - Exposer `/api/templates` (2 templates + version)
  - CRUD rapports: `/api/reports` + `/api/reports/{id}`
  - Rendu texte: `/api/reports/{id}/render`
  - Préparation email: `/api/reports/{id}/email/prepare`
  - Scope sans auth via header `X-Workspace-Id`

2) **Frontend**
  - Écran “Créer rapport”: choix type → formulaire par sections → preview texte
  - Actions: copier complet, copier section, enregistrer
  - Écran “Historique”: lister, ouvrir, modifier, supprimer
  - Écran “Email”: destinataires (optionnel) → préparer → ouvrir `mailto:` + copie
  - UI responsive Tailwind

3) **Dev Experience**
  - Docker Compose pour lancer MongoDB + backend + frontend
  - Scripts de test frontend/backend

4) **Tests (minimum)**
  - Backend: tests d’API (status codes, validation, rendu)
  - Frontend: tests de rendu + copie + validations
