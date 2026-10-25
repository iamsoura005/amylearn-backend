'use strict';

/**
 * `npm test` / `npm run verify` — boot the Express app on an ephemeral port
 * and run the smoke suite: health, DB ping and (when the database is up) the
 * full auth cycle plus a tenant-isolation probe.
 */

const axios = require('axios');

const results = [];
const record = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  // eslint-disable-next-line no-console
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

async function withServer(fn) {
  process.env.NODE_ENV = process.env.NODE_ENV || 'test';
  const app = require('../server');
  const server = app.listen(0);
  const port = server.address().port;
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    server.close();
  }
}

async function main() {
  await withServer(async (base) => {
    // --- Health ---------------------------------------------------------
    try {
      const { data, status } = await axios.get(`${base}/health`, { timeout: 8000 });
      record('GET /health', status === 200 && data && data.status === 'ok', `status=${status}`);
    } catch (error) {
      record('GET /health', false, error.message);
    }

    try {
      const { data, status } = await axios.get(`${base}/health?db=true`, { timeout: 8000 });
      record('GET /health?db=true', status === 200 && data && typeof data.db === 'object', `db.ok=${data.db && data.db.ok}`);
    } catch (error) {
      record('GET /health?db=true', false, error.message);
    }

    // --- DB-gated suite --------------------------------------------------
    let dbUp = false;
    try {
      const { data } = await axios.get(`${base}/health?db=true`, { timeout: 8000 });
      dbUp = Boolean(data.db && data.db.ok);
    } catch (error) {
      dbUp = false;
    }

    if (!dbUp) {
      record('auth cycle (skipped)', true, 'database unavailable — run npm run dev-db and seed first');
      return;
    }

    // --- Auth cycle ------------------------------------------------------
    let token = null;
    try {
      const { data, status } = await axios.post(
        `${base}/api/auth/signin`,
        { email: 'NBR2024CS042', password: 'campus@student123', collegeCode: 'NBR' },
        { timeout: 8000 }
      );
      token = data.token;
      record('POST /api/auth/signin (student)', status === 200 && Boolean(token), `role=${data.role}`);
    } catch (error) {
      record('POST /api/auth/signin (student)', false, error.response ? error.response.data.message : error.message);
    }

    if (token) {
      try {
        const { data, status } = await axios.get(`${base}/api/auth/verify-token`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000
        });
        record('GET /api/auth/verify-token', status === 200 && data.valid === true, `tenant=${data.tenant && data.tenant.collegeCode}`);
      } catch (error) {
        record('GET /api/auth/verify-token', false, error.message);
      }

      try {
        const { status } = await axios.get(`${base}/api/notices`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000
        });
        record('GET /api/notices (tenant-scoped)', status === 200, `status=${status}`);
      } catch (error) {
        record('GET /api/notices (tenant-scoped)', false, error.message);
      }

      try {
        await axios.get(`${base}/api/notices`, {
          headers: { Authorization: `Bearer ${token}`, 'x-tenant-id': '99999999-0000-0000-0000-000000000000' },
          timeout: 8000
        });
        record('tenant isolation (foreign tenant header)', false, 'request unexpectedly succeeded');
      } catch (error) {
        const code = error.response ? error.response.status : 0;
        record('tenant isolation (foreign tenant header)', code === 403 || code === 404, `status=${code}`);
      }
    }

    // --- Platform login ---------------------------------------------------
    try {
      const { data, status } = await axios.post(
        `${base}/it-admin/login`,
        { email: 'admin.support@amylearn.app', password: 'amylearn@admin123' },
        { timeout: 8000 }
      );
      record('POST /it-admin/login (platform admin)', status === 200 && Boolean(data.token), `role=${data.role}`);
    } catch (error) {
      record('POST /it-admin/login (platform admin)', false, error.response ? error.response.data.message : error.message);
    }
  });

  const failed = results.filter((result) => !result.ok);
  // eslint-disable-next-line no-console
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('[test] Harness failed:', error.message);
  process.exit(1);
});
