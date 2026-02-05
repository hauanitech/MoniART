export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/monitor_reports',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  maxPayloadSize: process.env.MAX_PAYLOAD_SIZE || '1mb',
};
