import app from './app.js';
import { config } from './config.js';
import { connectMongo } from './services/mongo.js';

async function main() {
  await connectMongo();
  app.listen(config.port, () => {
    console.log(`[server] Listening on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error('[fatal]', err);
  process.exit(1);
});
