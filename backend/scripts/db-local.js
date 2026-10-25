'use strict';

/**
 * `npm run db:local` — one-shot local database setup: boot embedded
 * PostgreSQL, push the locally-generated schema, regenerate the Prisma client,
 * seed the demo campus, then stop the database. Used for clean-slate
 * verification of the schema + seed pipeline.
 */

const { startEmbeddedPostgres, pushLocalSchema, LOCAL_DATABASE_URL, DEFAULT_PORT } = require('./localDb');

async function main() {
  process.env.DATABASE_URL = LOCAL_DATABASE_URL;
  const embedded = await startEmbeddedPostgres({ port: DEFAULT_PORT });

  let ok = pushLocalSchema();
  if (!ok) {
    // eslint-disable-next-line no-console
    console.error('[db-local] Schema push failed.');
    process.exitCode = 1;
  } else {
    const { runCommand } = require('./localDb');
    if (!runCommand('node seed_campus.js', 'demo seed')) {
      process.exitCode = 1;
    }
  }

  try {
    await embedded.stop();
  } catch (error) {
    /* nothing to do */
  }
  // eslint-disable-next-line no-console
  console.log(process.exitCode ? '[db-local] Finished with errors.' : '[db-local] Done.');
  process.exit(process.exitCode || 0);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('[db-local] Fatal:', error.message);
  process.exit(1);
});
