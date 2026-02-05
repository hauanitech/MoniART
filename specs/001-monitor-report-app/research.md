# Phase 0 — Research & Decisions

**Feature**: [spec.md](./spec.md)
**Date**: 2026-02-05
**Branch**: 001-monitor-report-app

Cette phase résout les points qui n’étaient pas explicités dans la spec fonctionnelle et fixe les décisions techniques nécessaires au plan.

## Decision 1 — Langage (JS vs TS)

- **Decision**: Utiliser TypeScript côté frontend et backend.
- **Rationale**: Réduit les erreurs (modèle de rapport, validation email, contrats API) et aide à maintenir la cohérence sans authentification.
- **Alternatives considered**:
  - JavaScript uniquement (plus rapide au départ, mais plus de risques d’incohérences et de bugs de validation).

## Decision 2 — Modèle des 2 types de rapports (contenu)

- **Decision**: Définir 2 templates avec sections communes + sections spécifiques, puis stocker le contenu sous forme structurée (champs + listes) et générer un rendu texte.
- **Rationale**: Permet un formulaire guidé tout en restant flexible (ex. nombre variable d’incidents).
- **Alternatives considered**:
  - Champ texte unique (plus simple, mais perd le guidage et la copie par section).

### Template: "Salles en B"

Sections proposées (MVP) :
- Métadonnées: date/heure, créneau (optionnel), moniteur (texte libre)
- Résumé: texte
- Présence / fréquentation: texte ou nombre (optionnel)
- Incidents: liste d’items {heure (opt), lieu (opt), description, action}
- Interventions / actions réalisées: liste de texte
- Matériel / salle: texte
- Remarques: texte

### Template: "BU"

Sections proposées (MVP) :
- Métadonnées: date/heure, créneau (optionnel), moniteur (texte libre)
- Résumé: texte
- Accueil / information: texte
- Incidents: liste d’items {heure (opt), zone (opt), description, action}
- Actions / suivi: liste de texte
- Affluence: texte ou nombre (optionnel)
- Remarques: texte

> Note: les libellés exacts peuvent être ajustés rapidement sans changer le stockage (car les champs sont versionnés via un templateId/templateVersion).

## Decision 3 — “Envoyer par mail” sans authentification

- **Decision**: Fournir un envoi assisté.
  - Le backend prépare objet + corps (et valide les destinataires si fournis).
  - Le frontend ouvre le client mail via un lien `mailto:` pré-rempli, et/ou propose une copie du contenu email.
- **Rationale**: Un envoi SMTP direct impliquerait gestion de secrets/identité et augmente fortement le risque (et ce n’est pas requis par la spec).
- **Alternatives considered**:
  - Envoi SMTP direct côté serveur (rejeté: gestion d’identifiants, délivrabilité, complexité).

## Decision 4 — Persistance MongoDB sans auth

- **Decision**: Exposer l’API sans login, mais scoper les données via un identifiant de “workspace” non devinable (généré et stocké côté navigateur), transmis à l’API.
- **Rationale**: Sans auth, il faut quand même éviter qu’un utilisateur tombe sur les rapports d’un autre (surtout si déployé au-delà d’une machine locale).
- **Alternatives considered**:
  - Tout stocker uniquement dans le navigateur (rejeté: demande de stack MongoDB et historique serveur utile).
  - Aucun scope (rejeté: risque de mélange de rapports).

## Decision 5 — Testing & Quality gates

- **Decision**:
  - Frontend: tests de composants et de flux (rendu, copie, validations)
  - Backend: tests API (CRUD + rendu + email prepare)
  - Contrat: OpenAPI comme référence
- **Rationale**: Garantit la non-régression sur les 4 user stories.
- **Alternatives considered**:
  - Tests manuels uniquement (rejeté: risque de régressions sur modèle/rendu).

## Decision 6 — Responsive UI (Tailwind)

- **Decision**: Mise en page “mobile-first” avec breakpoints, et composants simples: header, form sections, preview, actions sticky.
- **Rationale**: Remplit NFR-001 sans complexité.
- **Alternatives considered**:
  - UI non responsive (rejeté: NFR-001).
