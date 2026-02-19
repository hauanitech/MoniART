export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/monitor_reports',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  maxPayloadSize: process.env.MAX_PAYLOAD_SIZE || '1mb',
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret-in-production',
  adminName: process.env.ADMIN_NAME || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  icsBaseUrl: process.env.ICS_BASE_URL || 'https://ics.ent.upf.pf/ics/ics_salle.php',
  icsCacheTtlMs: parseInt(process.env.ICS_CACHE_TTL_MS || '300000', 10), // 5 min
};
