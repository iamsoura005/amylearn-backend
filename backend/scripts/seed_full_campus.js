'use strict';

/**
 * `npm run seed:full` — the complete demo campus seed (same dataset as the
 * root seed_campus.js, exposed through the scripts entry).
 */

const { runSeed } = require('../seed_campus');
const { prisma } = require('../config/prisma');

runSeed()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error('[seed:full] Failed:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  });
