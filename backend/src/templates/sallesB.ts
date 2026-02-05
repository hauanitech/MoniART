import { ReportTemplate } from '../models/report.js';

export const sallesBTemplate: ReportTemplate = {
  id: 'salles-b@1',
  type: 'SALLES_B',
  version: 1,
  sections: [
    { key: 'summary', label: 'Résumé', kind: 'text', required: true },
    { key: 'attendance', label: 'Présence / fréquentation', kind: 'text', required: false },
    { key: 'incidents', label: 'Incidents', kind: 'list', required: false },
    { key: 'interventions', label: 'Interventions / actions réalisées', kind: 'list', required: false },
    { key: 'equipment', label: 'Matériel / salle', kind: 'text', required: false },
    { key: 'remarks', label: 'Remarques', kind: 'text', required: false },
  ],
};
