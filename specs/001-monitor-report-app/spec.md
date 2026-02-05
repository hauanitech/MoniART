# Feature Specification: Rédaction de rapports moniteur

**Feature Branch**: `001-monitor-report-app`  
**Created**: 2026-02-05  
**Status**: Draft  
**Input**: User description: "Crée une app web pour faciliter la rédaction de rapport pour moniteur. 2 types de rapport (Salles en B / BU). Possibilité d'envoyer rapport par mail, copier, et stocker le/les rapports. Sans auth."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Rédiger un rapport depuis un modèle (Priority: P1)

En tant que moniteur, je veux choisir un type de rapport (Salles en B ou BU) et remplir un formulaire guidé afin de produire un rapport clair et structuré.

**Why this priority**: C'est la valeur principale de l'app : réduire le temps et les oublis lors de la rédaction.

**Independent Test**: Peut être testé en créant un rapport complet pour chaque type, sans utiliser les fonctions de stockage, copie ou email.

**Acceptance Scenarios**:

1. **Given** l'utilisateur ouvre l'app, **When** il sélectionne le type "Salles en B", remplit les champs requis et génère le rendu, **Then** un rapport formaté est affiché avec les informations saisies.
2. **Given** l'utilisateur ouvre l'app, **When** il sélectionne le type "BU", remplit les champs requis et génère le rendu, **Then** un rapport formaté est affiché avec les sections propres au type BU.

---

### User Story 2 - [Brief Title] (Priority: P2)

En tant que moniteur, je veux pouvoir copier le rapport (en entier ou par sections) afin de le coller rapidement dans un email, un document ou un outil interne.

**Why this priority**: La copie est le moyen le plus simple et universel de réutiliser le rapport.

**Independent Test**: Peut être testé en générant un rapport puis en déclenchant l'action "Copier" et en collant le contenu dans un éditeur.

**Acceptance Scenarios**:

1. **Given** un rapport est affiché, **When** l'utilisateur clique "Copier", **Then** le contenu du rapport est copié et un retour visuel confirme la réussite.
2. **Given** un rapport est affiché, **When** l'utilisateur choisit "Copier une section" (ex. incidents), **Then** seule cette section est copiée.

---

### User Story 3 - [Brief Title] (Priority: P3)

En tant que moniteur, je veux pouvoir stocker mes rapports et les retrouver plus tard pour les relire, les modifier, ou les renvoyer.

**Why this priority**: Évite de perdre l'historique et permet de réutiliser des contenus.

**Independent Test**: Peut être testé en enregistrant plusieurs rapports, en les listant, en en rouvrant un, puis en le modifiant et en le ré-enregistrant.

**Acceptance Scenarios**:

1. **Given** un rapport est affiché, **When** l'utilisateur clique "Enregistrer", **Then** le rapport apparaît dans une liste d'historique avec date, type et un titre.
2. **Given** des rapports existent dans l'historique, **When** l'utilisateur en ouvre un, **Then** le rapport se charge avec son contenu et peut être modifié.
3. **Given** un rapport existe dans l'historique, **When** l'utilisateur le supprime, **Then** il n'est plus accessible depuis la liste après confirmation.

---

### User Story 4 - Préparer l'envoi par email (Priority: P3)

En tant que moniteur, je veux préparer un email contenant le rapport (objet + corps) afin de l'envoyer facilement depuis mon outil de messagerie.

**Why this priority**: Beaucoup de rapports finissent envoyés par email ; la préparation réduit les erreurs et le temps.

**Independent Test**: Peut être testé en générant un rapport puis en utilisant l'action "Préparer email" pour obtenir un email prêt à envoyer.

**Acceptance Scenarios**:

1. **Given** un rapport est affiché, **When** l'utilisateur clique "Préparer email", **Then** l'app propose un objet et un corps d'email contenant le rapport.
2. **Given** l'utilisateur saisit une liste de destinataires, **When** l'app prépare l'email, **Then** les adresses sont validées (format) et les adresses invalides sont signalées.

### Edge Cases

- Rapport vide ou incomplet : champs requis manquants lors de la génération.
- Données très longues (ex. beaucoup d'incidents) : le rendu reste lisible.
- Copie impossible (permissions/limitations) : proposer une alternative (ex. sélection manuelle) et afficher un message clair.
- Historique plein ou indisponible : expliquer la situation et éviter la perte silencieuse.
- Adresse email invalide : signaler précisément le(s) champ(s) concerné(s).
- Suppression accidentelle : demander confirmation avant suppression définitive.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système MUST permettre de créer un nouveau rapport en choisissant un type : "Salles en B" ou "BU".
- **FR-002**: Le système MUST fournir, pour chaque type, un modèle avec des sections prédéfinies et des champs requis clairement identifiés.
- **FR-003**: Le système MUST permettre de générer un rendu texte du rapport (format lisible, prêt à copier).
- **FR-004**: Les utilisateurs MUST pouvoir copier le rapport complet vers le presse-papiers.
- **FR-005**: Les utilisateurs MUST pouvoir copier une section spécifique du rapport.
- **FR-006**: Le système MUST permettre d'enregistrer un rapport dans un historique et de lister les rapports enregistrés.
- **FR-007**: Le système MUST permettre d'ouvrir, modifier et ré-enregistrer un rapport existant.
- **FR-008**: Le système MUST permettre de supprimer un rapport de l'historique avec confirmation.
- **FR-009**: Le système MUST permettre de préparer un email (objet + corps) contenant le rapport.
- **FR-010**: Le système MUST permettre de saisir un ou plusieurs destinataires et valider le format des adresses.
- **FR-011**: Le système MUST fonctionner sans authentification (aucun compte, aucun login requis).

### Non-Functional Requirements

- **NFR-001**: L'interface MUST être utilisable sur mobile et desktop (mise en page adaptative).
- **NFR-002**: Les actions principales (créer/générer/copier/enregistrer/ouvrir/supprimer/préparer email) MUST être réalisables avec un nombre minimal d'étapes et des libellés clairs.
- **NFR-003**: Les données enregistrées MUST persister entre deux ouvertures de l'application sur un même environnement utilisateur.
- **NFR-004**: L'application MUST pouvoir être exécutée en environnement de développement via une procédure reproductible en une commande (incluant les dépendances).

### Assumptions

- Le stockage des rapports est persistant pour l'utilisateur sur un même environnement (ex. même navigateur / même instance d'application) ; le partage multi-appareils n'est pas garanti.
- L'envoi email est "assisté" : l'app prépare le contenu (objet/corps) et l'utilisateur envoie via son outil de messagerie habituel.
- Les rapports sont destinés à une utilisation interne ; l'app n'impose pas de workflow de validation.

### Out of Scope

- Gestion d'utilisateurs, rôles, permissions.
- Envoi d'emails "au nom de" l'utilisateur sans action de sa part.
- Synchronisation automatique des rapports entre appareils.

### Requirement Coverage (FR → Scénarios)

- FR-001, FR-002, FR-003 → User Story 1 (Scénarios 1-2)
- FR-004, FR-005 → User Story 2 (Scénarios 1-2)
- FR-006, FR-007, FR-008 → User Story 3 (Scénarios 1-3)
- FR-009, FR-010 → User Story 4 (Scénarios 1-2)
- FR-011 → Contrainte globale (toutes les User Stories)

### Key Entities *(include if feature involves data)*

- **Rapport**: document rédigé par un moniteur ; attributs clés : type (Salles en B/BU), date/heure, contenu structuré par sections, auteur (optionnel en texte libre), statut (brouillon/enregistré).
- **Type de rapport**: définit la structure attendue (sections, champs requis, ordre) pour "Salles en B" et pour "BU".
- **Entrée d'historique**: référence un rapport enregistré ; attributs clés : identifiant, date de création/modification, type, titre/objet.
- **Destinataire**: une ou plusieurs adresses email (texte) utilisées lors de la préparation d'email.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un moniteur peut produire un rapport complet (Salles en B ou BU) en moins de 5 minutes lors d'un test utilisateur.
- **SC-002**: Au moins 95% des tentatives de copie du rapport aboutissent, avec un message explicite en cas d'échec.
- **SC-003**: Un utilisateur peut retrouver et rouvrir un rapport enregistré en moins de 10 secondes (depuis l'écran d'historique).
- **SC-004**: Au moins 90% des utilisateurs réussissent à préparer un email contenant le rapport sans assistance (test d'acceptation).
