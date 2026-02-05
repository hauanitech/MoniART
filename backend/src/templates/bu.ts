import { ReportTemplate } from '../models/report.js';

export const buTemplate: ReportTemplate = {
  id: 'bu@2',
  type: 'BU',
  version: 2,
  sections: [
    { key: 'interventionCount', label: 'Nombre d\'interventions', kind: 'number', required: false },
    { key: 'interventionTypes', label: 'Types d\'interventions / problèmes rencontrés', kind: 'text', required: false },
    {
      key: 'laptopLoans',
      label: 'Prêt d\'ordinateurs',
      kind: 'numberList',
      required: false,
      format: 'BUPF{n}',
    },
    {
      key: 'laptopReturns',
      label: 'Retour d\'ordinateurs',
      kind: 'numberList',
      required: false,
      format: 'BUPF{n}',
    },
    { key: 'computersProcessed', label: 'Ordinateurs traités', kind: 'text', required: false },
    {
      key: 'equipmentProcessed',
      label: 'Matériels traités',
      kind: 'numberList',
      required: false,
      format: 'Mat {n}',
    },
    { key: 'printHelp', label: 'Aides impressions', kind: 'number', required: false },
    { key: 'remarks', label: 'Autres observations', kind: 'text', required: false },
  ],
};
