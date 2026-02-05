import { ReportTemplate } from '../models/report.js';

export const sallesBTemplate: ReportTemplate = {
  id: 'salles-b@2',
  type: 'SALLES_B',
  version: 2,
  sections: [
    { key: 'interventionCount', label: 'Nombre d\'interventions', kind: 'number', required: false },
    { key: 'interventionTypes', label: 'Types d\'interventions / problèmes rencontrés', kind: 'text', required: false },
    {
      key: 'rooms',
      label: 'Salles du bâtiment B',
      kind: 'roomChecklist',
      required: false,
      roomConfig: {
        rooms: ['B2-1', 'B2-2', 'B2-3', 'B2-4', 'B1-2', 'B1-3'],
        checkItems: [
          { key: 'f1', label: 'F1' },
          { key: 'cablesEcran', label: 'Cables Ecran Débranchée' },
          { key: 'cablesReseau', label: 'Cables Réseau Débranchée' },
          { key: 'cablesClientLeger', label: 'Cables Client Léger Débranchée' },
          { key: 'porteMalFermee', label: 'Porte mal fermée' },
          { key: 'climAllumee', label: 'Climatisation allumée' },
          { key: 'projecteurAllume', label: 'Projecteur Allumé' },
          { key: 'oubliFermetureSession', label: 'Oublie fermeture de session' },
        ],
      },
    },
    { key: 'printHelp', label: 'Aides impressions', kind: 'number', required: false },
    { key: 'remarks', label: 'Autres observations', kind: 'text', required: false },
  ],
};
