import app from './app.js';
import { config } from './config.js';
import { connectMongo } from './services/mongo.js';
import { initAdmin } from './services/adminInit.js';
import { ensureTimeblockIndexes } from './services/timeblockRepository.js';
import { ensureOverlayIndexes } from './services/overlayRepository.js';

async function main() {
  await connectMongo();
  await initAdmin();
  await ensureTimeblockIndexes();
  await ensureOverlayIndexes();
  app.listen(config.port, () => {
    console.log(`[server] Listening on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error('[fatal]', err);
  process.exit(1);
});
