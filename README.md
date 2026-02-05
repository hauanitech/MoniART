# MoniART — Rapports Moniteur

Application web pour faciliter la rédaction de rapports de surveillance (moniteur). Deux types de rapports : **Salles en B** et **BU**.

## Fonctionnalités

- 📝 **Créer un rapport** depuis un modèle guidé (sections texte + listes d'incidents)
- 📋 **Copier** le rapport complet ou section par section (Clipboard API + fallback)
- 📚 **Historique** — lister, modifier, ré-enregistrer ou supprimer des rapports
- ✉️ **Email assisté** — préparer l'objet et le corps puis ouvrir le client mail (`mailto:`)
- 🔒 **Sans authentification** — chaque navigateur reçoit un `workspaceId` unique stocké en `localStorage`

## Stack technique

| Couche    | Technologie                      |
|-----------|----------------------------------|
| Frontend  | React 18, TypeScript, Vite, Tailwind CSS |
| Backend   | Express 4, TypeScript, MongoDB driver |
| Base de données | MongoDB 7                  |
| Dev env   | Docker Compose                   |

## Démarrage rapide (Docker)

```bash
# Cloner le repo
git clone <url> && cd MoniART

# Lancer les 3 services (mongo + backend + frontend)
docker compose up --build
```

- **Frontend** : http://localhost:3000
- **API** : http://localhost:3001
- **MongoDB** : localhost:27017

## Démarrage sans Docker

### Backend
```bash
cd backend
npm install
# Assurez-vous que MongoDB tourne sur localhost:27017
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Variables d'environnement

### Backend (`backend/.env`)
| Variable | Défaut | Description |
|----------|--------|-------------|
| `PORT` | `3001` | Port du serveur Express |
| `MONGODB_URI` | `mongodb://localhost:27017/monitor_reports` | URI MongoDB |
| `CORS_ORIGIN` | `*` | Origines CORS autorisées |
| `MAX_PAYLOAD_SIZE` | `1mb` | Taille max du body JSON |

### Frontend (`frontend/.env`)
| Variable | Défaut | Description |
|----------|--------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:3001` | URL de l'API backend |

## API Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/templates` | Liste des modèles de rapport |
| `GET` | `/api/reports` | Liste des rapports (filtre ?type=) |
| `POST` | `/api/reports` | Créer un rapport |
| `GET` | `/api/reports/:id` | Détail d'un rapport |
| `PUT` | `/api/reports/:id` | Modifier un rapport |
| `DELETE` | `/api/reports/:id` | Supprimer un rapport |
| `POST` | `/api/reports/:id/render` | Générer le texte du rapport |
| `POST` | `/api/reports/:id/email/prepare` | Préparer un email |

> Tous les endpoints sous `/api/*` requièrent le header `X-Workspace-Id`.

## Structure du projet

```
MoniART/
├── docker-compose.yml
├── backend/
│   ├── src/
│   │   ├── api/           # Routes, middleware, router
│   │   ├── models/        # Types TypeScript
│   │   ├── services/      # Logique métier (repository, renderer, email)
│   │   └── templates/     # Définitions des modèles de rapport
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Composants React réutilisables
│   │   ├── pages/         # Pages (Create, History, Edit, Email)
│   │   ├── services/      # API client, clipboard, mailto, workspace
│   │   └── styles/        # Tailwind CSS
│   └── package.json
└── specs/                 # Spécifications & documentation
```

## Licence

Projet personnel.
