'use strict';

/**
 * `npm run dev-db` — boots the embedded local PostgreSQL and keeps it alive
 * while the schema is pushed and the Prisma client regenerated. Run this in
 * one terminal and `npm run dev` in another. Ctrl+C stops the database.
 */

const { startEmbeddedPostgres, pushLocalSchema, LOCAL_DATABASE_URL, DEFAULT_PORT } = require('./localDb');

async function main() {
  process.env.DATABASE_URL = LOCAL_DATABASE_URL;
  const embedded = await startEmbeddedPostgres({ port: DEFAULT_PORT });
  pushLocalSchema();
  // eslint-disable-next-line no-console
  console.log(`[local-db] AmyLearn local database ready on :${DEFAULT_PORT} (amylearn)`);
  // eslint-disable-next-line no-console
  console.log('[local-db] Keep this terminal running; press Ctrl+C to stop.');

  const shutdown = async () => {
    try {
      await embedded.stop();
      // eslint-disable-next-line no-console
      console.log('\n[local-db] Stopped.');
    } catch (error) {
      /* nothing to do */
    }
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('[local-db] Fatal:', error.message);
  process.exit(1);
});
