---

description: "Task list for feature implementation"

---

# Tasks: Monitor Report App (rapports moniteur)

**Input**: Design documents from `/specs/001-monitor-report-app/`

**Docs used**:
- spec.md (user stories + acceptance)
- plan.md (stack + structure)
- research.md (décisions)
- data-model.md (entités)
- contracts/openapi.yaml (endpoints)
- quickstart.md (démarrage dev)

**Organization**: Les tâches sont groupées par user story pour permettre une implémentation incrémentale.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialiser la structure du repo et le dev environnement (Docker Compose).

- [X] T001 Créer la structure de dossiers `backend/src/{api,models,services,templates}` et `frontend/src/{components,pages,services,styles}`
- [X] T002 Initialiser le backend Node/TS dans `backend/package.json` (scripts dev/build/start) et config TS dans `backend/tsconfig.json`
- [X] T003 [P] Initialiser le frontend React/TS dans `frontend/package.json` et config build dans `frontend/vite.config.ts`
- [X] T004 [P] Configurer Tailwind (responsive) dans `frontend/tailwind.config.js`, `frontend/postcss.config.js`, `frontend/src/styles/tailwind.css`
- [X] T005 [P] Ajouter Dockerfiles dev dans `backend/Dockerfile` et `frontend/Dockerfile` + `.dockerignore` correspondants
- [X] T006 Ajouter `docker-compose.yml` à la racine pour lancer MongoDB + backend + frontend
- [X] T007 [P] Ajouter exemples de config dans `backend/.env.example` et `frontend/.env.example`
- [X] T008 [P] Ajouter standards repo (`.editorconfig`, `.gitignore`) à la racine

**Checkpoint**: `docker compose up --build` démarre les 3 services (cf. `specs/001-monitor-report-app/quickstart.md`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Socle commun requis par toutes les user stories (API, DB, workspace sans auth, client API frontend).

- [X] T009 Implémenter le serveur Express et le routing de base dans `backend/src/app.ts`, `backend/src/server.ts`, `backend/src/api/router.ts`
- [X] T010 [P] Ajouter middleware commun (JSON, CORS, logging) dans `backend/src/api/middleware/http.ts`
- [X] T011 Implémenter config/env backend (PORT, MONGODB_URI) dans `backend/src/config.ts`
- [X] T012 Implémenter la connexion MongoDB dans `backend/src/services/mongo.ts`
- [X] T013 Implémenter la lecture/validation du header `X-Workspace-Id` dans `backend/src/api/middleware/workspace.ts`
- [X] T014 Définir les types + validation des entités (Report, sections, metadata) dans `backend/src/models/report.ts`
- [X] T015 Définir les templates (Salles en B / BU) dans `backend/src/templates/sallesB.ts`, `backend/src/templates/bu.ts`, `backend/src/templates/index.ts`
- [X] T016 Implémenter le repository Mongo (CRUD + scope workspace) dans `backend/src/services/reportRepository.ts`
- [X] T017 Implémenter endpoint templates `GET /api/templates` dans `backend/src/api/routes/templates.ts`
- [X] T018 Implémenter endpoints rapports (create/read/update/delete + list) dans `backend/src/api/routes/reports.ts`
- [X] T019 Ajouter gestion d'erreurs centralisée (format erreur API) dans `backend/src/api/middleware/errorHandler.ts`
- [X] T020 Implémenter client HTTP frontend + gestion baseURL dans `frontend/src/services/apiClient.ts`
- [X] T021 Implémenter génération/persistance de `workspaceId` et injection header dans `frontend/src/services/workspace.ts`
- [X] T022 [P] Créer layout responsive + navigation (Créer / Historique / Email) dans `frontend/src/components/Layout.tsx` et `frontend/src/components/NavBar.tsx`

**Checkpoint**: l’API répond sur `/api/templates` et `/api/reports` avec `X-Workspace-Id` requis, et le frontend peut appeler l’API via `frontend/src/services/apiClient.ts`.

---

## Phase 3: User Story 1 — Rédiger un rapport depuis un modèle (Priority: P1) 🎯 MVP

**Goal**: Choisir un type (Salles en B / BU), remplir un formulaire guidé, sauvegarder le rapport, afficher un rendu texte formaté.

**Independent Test**: Depuis l’UI, créer un rapport de chaque type, voir le preview texte, et vérifier que le rendu contient les sections attendues.

- [X] T023 [P] [US1] Implémenter le rendu texte (texte complet + texte par section) dans `backend/src/services/reportRenderer.ts`
- [X] T024 [US1] Exposer `POST /api/reports/{reportId}/render` dans `backend/src/api/routes/reportsRender.ts` et l'enregistrer dans `backend/src/api/router.ts`
- [X] T025 [US1] Compléter la création de rapport (validation + titre par défaut + templateId/version) dans `backend/src/api/routes/reports.ts`
- [X] T026 [P] [US1] Implémenter le sélecteur de type/template dans `frontend/src/components/ReportTypePicker.tsx`
- [X] T027 [US1] Implémenter le formulaire guidé (sections texte + listes) dans `frontend/src/components/ReportForm.tsx`
- [X] T028 [P] [US1] Implémenter l'éditeur d'incidents (add/remove) dans `frontend/src/components/IncidentListEditor.tsx`
- [X] T029 [US1] Implémenter la page de création + appel API create + render dans `frontend/src/pages/CreateReportPage.tsx`
- [X] T030 [US1] Implémenter l'affichage du rendu (texte + sections) dans `frontend/src/components/ReportPreview.tsx`

**Checkpoint**: US1 complet — l’app permet de produire un rapport formaté depuis un modèle.

---

## Phase 4: User Story 2 — Copier le rapport (Priority: P2)

**Goal**: Copier le rapport complet ou une section spécifique.

**Independent Test**: Générer un rapport, copier le rapport complet puis une section, et coller dans un éditeur.

- [X] T031 [P] [US2] Implémenter utilitaire de copie (Clipboard API + fallback) dans `frontend/src/services/clipboard.ts`
- [X] T032 [US2] Ajouter action "Copier" (rapport complet) dans `frontend/src/components/ReportPreview.tsx`
- [X] T033 [US2] Ajouter action "Copier une section" (menu/CTA) dans `frontend/src/components/ReportPreview.tsx`
- [X] T034 [US2] Ajouter feedback utilisateur (toast) dans `frontend/src/components/Toast.tsx` et l'intégrer dans `frontend/src/components/ReportPreview.tsx`

**Checkpoint**: US2 complet — copie fiable avec feedback et fallback en cas d’échec.

---

## Phase 5: User Story 3 — Stocker et retrouver l’historique (Priority: P3)

**Goal**: Lister, ouvrir, modifier, ré-enregistrer et supprimer des rapports.

**Independent Test**: Enregistrer 2 rapports, les voir dans Historique, en rouvrir un, modifier, ré-enregistrer, puis supprimer l’autre.

- [X] T035 [US3] Implémenter le tri + filtre (par type optionnel) sur `GET /api/reports` dans `backend/src/api/routes/reports.ts`
- [X] T036 [US3] Renforcer le scope workspace (GET/PUT/DELETE) dans `backend/src/services/reportRepository.ts`
- [X] T037 [P] [US3] Implémenter méthodes API frontend (list/get/update/delete) dans `frontend/src/services/reportsApi.ts`
- [X] T038 [US3] Implémenter l'écran Historique (liste + ouverture) dans `frontend/src/pages/HistoryPage.tsx`
- [X] T039 [US3] Implémenter l'écran Édition (réutilise form + preview) dans `frontend/src/pages/EditReportPage.tsx`
- [X] T040 [US3] Implémenter confirmation suppression dans `frontend/src/components/ConfirmDialog.tsx` et l'intégrer dans `frontend/src/pages/HistoryPage.tsx`
- [X] T041 [US3] Garantir `updatedAt` et titre par défaut lors des updates dans `backend/src/services/reportRepository.ts`

**Checkpoint**: US3 complet — l’historique est utilisable et sûr (scope workspace).

---

## Phase 6: User Story 4 — Préparer l’envoi par email (Priority: P3)

**Goal**: Générer un objet + corps email et assister l’envoi via `mailto:`.

**Independent Test**: Sur un rapport existant, préparer un email, saisir des destinataires, vérifier la validation, puis ouvrir le client mail.

- [X] T042 [P] [US4] Implémenter préparation email (subject/body + validation destinataires) dans `backend/src/services/emailPreparer.ts`
- [X] T043 [US4] Implémenter endpoint `POST /api/reports/{reportId}/email/prepare` dans `backend/src/api/routes/email.ts` et l'enregistrer dans `backend/src/api/router.ts`
- [X] T044 [P] [US4] Implémenter page Email (saisie destinataires + affichage résultat) dans `frontend/src/pages/EmailPage.tsx`
- [X] T045 [US4] Implémenter génération/ouverture lien mailto + encodage dans `frontend/src/services/mailto.ts`
- [X] T046 [US4] Afficher destinataires invalides + guidance utilisateur dans `frontend/src/pages/EmailPage.tsx`

**Checkpoint**: US4 complet — email assisté prêt à envoyer.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T047 [P] Harmoniser styles (mobile-first, spacing, typographie) dans `frontend/src/styles/tailwind.css` et composants `frontend/src/components/*`
- [X] T048 [P] Aligner `docker-compose.yml` avec `specs/001-monitor-report-app/quickstart.md` (ports, env vars, volumes)
- [X] T049 Documenter le démarrage et variables dans `README.md` + synchroniser `specs/001-monitor-report-app/quickstart.md`
- [X] T050 Ajouter durcissement minimum (CORS configurable + limites payload) dans `backend/src/api/middleware/http.ts` et `backend/src/config.ts`
- [X] T051 Valider manuellement le quickstart en suivant `specs/001-monitor-report-app/quickstart.md` et corriger si nécessaire

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1) → Foundational (Phase 2) → US1 (Phase 3) → (US2/US3/US4 en parallèle) → Polish

### User Story Dependency Graph

- **US1** est requis pour US2/US3/US4 (car ils opèrent sur un rapport existant + rendu)
- **US2** indépendant de US3/US4 après US1
- **US3** indépendant de US2/US4 après US1
- **US4** indépendant de US2/US3 après US1

---

## Parallel Opportunities

- Phase 1: T003, T004, T005, T007, T008 peuvent avancer en parallèle après T001/T002.
- Phase 2: backend (T009–T019) et frontend (T020–T022) peuvent être découpés par devs, mais `X-Workspace-Id` (T013/T021) doit être cohérent.
- Après US1: US2, US3, US4 peuvent être développées en parallèle.

### Parallel Example: US1

- Backend en parallèle:
  - T023 (renderer) + T024 (route render) + T025 (create validation)
- Frontend en parallèle:
  - T026 (picker) + T027 (form) + T028 (incidents editor)

### Parallel Example: US3

- API frontend `frontend/src/services/reportsApi.ts` (T037) en parallèle de l’UI Historique (T038) si l’interface est mockée temporairement.

---

## Implementation Strategy

### MVP Scope (recommended)

- Implémenter Phase 1 + Phase 2 + **US1 uniquement** (jusqu’au checkpoint US1).

### Incremental Delivery

- Ajouter US2 → validation copie
- Ajouter US3 → historique complet
- Ajouter US4 → email assisté
- Finir par Polish
