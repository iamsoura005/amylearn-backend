'use strict';

/**
 * `npm run seed:minimal` — platform accounts + demo tenant + a campus admin
 * only. Enough to boot every portal. Safe to run repeatedly.
 */

const { runSeed: runFullSeed } = require('../seed_campus');

runFullSeed()
  .then(async () => {
    const { prisma } = require('../config/prisma');
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('[seed:minimal] Failed:', error.message);
    process.exit(1);
  });
