'use strict';

/**
 * Shared helpers for the local embedded PostgreSQL workflow.
 * `npm run dev-db` keeps the database alive; `npm run db:local` is one-shot.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BACKEND_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(BACKEND_DIR, '.pgdata');
const LOCAL_SCHEMA_PATH = path.join(BACKEND_DIR, 'prisma', 'schema.local.prisma');
const CANONICAL_SCHEMA_PATH = path.join(BACKEND_DIR, 'prisma', 'schema.prisma');

const DEFAULT_PORT = 5433;
const LOCAL_DATABASE_URL = `postgresql://postgres:postgres@localhost:${DEFAULT_PORT}/amylearn?schema=public`;

function writeLocalSchema() {
  const source = fs.readFileSync(CANONICAL_SCHEMA_PATH, 'utf8');
  const local = source.replace(/provider\s*=\s*"cockroachdb"/, 'provider = "postgresql"');
  fs.writeFileSync(LOCAL_SCHEMA_PATH, local);
  return LOCAL_SCHEMA_PATH;
}

function runCommand(command, label) {
  try {
    execSync(command, { cwd: BACKEND_DIR, stdio: ['ignore', 'pipe', 'pipe'], env: process.env });
    // eslint-disable-next-line no-console
    console.log(`[local-db] ${label}: ok`);
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[local-db] ${label} failed: ${String(error.stdout || error.message).slice(0, 1200)}`);
    return false;
  }
}

async function startEmbeddedPostgres({ port = DEFAULT_PORT } = {}) {
  const embeddedPostgresModule = require('embedded-postgres');
  const EmbeddedPostgres = embeddedPostgresModule.default || embeddedPostgresModule;
  const embedded = new EmbeddedPostgres({
    databaseDir: DATA_DIR,
    user: 'postgres',
    password: 'postgres',
    port,
    persistent: true
  });
  const alreadyInitialised = fs.existsSync(path.join(DATA_DIR, 'PG_VERSION'));
  if (!alreadyInitialised) {
    try {
      await embedded.initialise();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`[local-db] initialise failed: ${error.message}`);
      throw error;
    }
  }
  try {
    await embedded.start();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`[local-db] start: ${error.message}`);
  }
  try {
    await embedded.createDatabase('amylearn');
  } catch (error) {
    // Database likely already exists — that is fine.
  }
  return embedded;
}

/**
 * Push the locally-generated schema and regenerate the Prisma client.
 */
function pushLocalSchema() {
  const schema = writeLocalSchema();
  if (!runCommand('npx prisma db push --schema prisma/schema.local.prisma --skip-generate', 'db push')) {
    return false;
  }
  return runCommand(`npx prisma generate --schema ${schema.replace(/\\/g, '/')}`, 'prisma generate');
}

module.exports = {
  BACKEND_DIR,
  DATA_DIR,
  LOCAL_SCHEMA_PATH,
  DEFAULT_PORT,
  LOCAL_DATABASE_URL,
  writeLocalSchema,
  pushLocalSchema,
  startEmbeddedPostgres,
  runCommand
};
