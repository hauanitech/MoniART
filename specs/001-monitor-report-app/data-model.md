# Phase 1 — Data Model

**Feature**: [spec.md](./spec.md)
**Research**: [research.md](./research.md)
**Date**: 2026-02-05

## Entities

### 1) Workspace

Représente un “espace” logique sans authentification.

- **id**: string (généré côté client, non devinable)
- **createdAt**: datetime
- **lastSeenAt**: datetime

**Rules**:
- Un rapport appartient à exactement 1 workspace.
- Le workspace id est transmis à chaque appel API.

---

### 2) ReportType

Enum applicatif (pas forcément stocké en DB).

- **code**: `SALLES_B` | `BU`
- **label**: string

---

### 3) ReportTemplate

Décrit le formulaire et les sections attendues.

- **id**: string (ex. `salles-b@1`, `bu@1`)
- **type**: ReportType
- **version**: integer
- **sections**: array of ReportSectionDefinition

`ReportSectionDefinition`:
- **key**: string (stable, ex. `summary`, `incidents`)
- **label**: string (affiché)
- **kind**: `text` | `list`
- **required**: boolean

**Rules**:
- Une nouvelle version de template ne casse pas les anciens rapports (un rapport référence templateId + version).

---

### 4) Report

Rapport sauvegardé dans l’historique.

- **id**: string
- **workspaceId**: string (FK Workspace)
- **type**: ReportType
- **templateId**: string
- **templateVersion**: integer
- **title**: string (utilisé dans l’historique + objet email par défaut)
- **createdAt**: datetime
- **updatedAt**: datetime
- **metadata**: object
  - **reportDate**: date
  - **shiftLabel**: string (optionnel)
  - **authorName**: string (optionnel)
- **sections**: object (clé → valeur)
  - pour `text`: string
  - pour `list`: array d’items

`IncidentItem` (pour sections `incidents`):
- **time**: string (optionnel, format libre ou HH:mm)
- **location**: string (optionnel)
- **description**: string (requis)
- **actionTaken**: string (optionnel)

**Validation rules**:
- `workspaceId` requis.
- `type` requis et dans l’enum.
- `title` requis (fallback: généré à partir du type + date).
- `metadata.reportDate` requis.
- Les sections marquées `required=true` dans le template doivent être non vides.
- Email recipients (si fournis) : format adresse email valide.

**State transitions**:
- Brouillon (non persisté) → Enregistré (persisté)
- Enregistré → Modifié → Enregistré
- Enregistré → Supprimé

## Derived Views

### RenderedReport

Représentation texte générée à la demande.

- **reportId**: string
- **text**: string (plain text)
- **sectionsText**: map(sectionKey → string) (pour "copier une section")

### PreparedEmail

- **subject**: string
- **body**: string
- **to**: array<string> (optionnel)
- **invalidRecipients**: array<string> (si validation)
