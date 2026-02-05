import { ReportTemplate } from '../models/report.js';

export const buTemplate: ReportTemplate = {
  id: 'bu@1',
  type: 'BU',
  version: 1,
  sections: [
    { key: 'summary', label: 'Résumé', kind: 'text', required: true },
    { key: 'reception', label: 'Accueil / information', kind: 'text', required: false },
    { key: 'incidents', label: 'Incidents', kind: 'list', required: false },
    { key: 'actions', label: 'Actions / suivi', kind: 'list', required: false },
    { key: 'attendance', label: 'Affluence', kind: 'text', required: false },
    { key: 'remarks', label: 'Remarques', kind: 'text', required: false },
  ],
};
