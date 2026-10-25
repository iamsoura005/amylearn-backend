'use strict';

const router = require('express').Router();
const { optionalTenantContext } = require('../middleware/authMiddleware');
const { getMenuForRole, defaultFeatureFlags, defaultFeatureMatrix, FEATURE_KEYS } = require('../config/masterFeatures');
const { getJson, setJson, getTenantJson, setTenantJson } = require('../utils/systemConfig');
const { asyncHandler, httpError } = require('../utils/apiHelpers');

const FLAGS_KEY = 'master_feature_flags';
const MATRIX_KEY = 'master_feature_matrix';

async function readFlags() {
  const stored = await getJson(FLAGS_KEY, null);
  return stored && typeof stored === 'object' ? { ...defaultFeatureFlags(), ...stored } : defaultFeatureFlags();
}

async function readMatrix() {
  const stored = await getJson(MATRIX_KEY, null);
  return stored && typeof stored === 'object' ? { ...defaultFeatureMatrix(), ...stored } : defaultFeatureMatrix();
}

router.use(optionalTenantContext);

// GET /features — master flag set (public read)
router.get(
  '/features',
  asyncHandler(async (req, res) => {
    const [flags, matrix] = await Promise.all([readFlags(), readMatrix()]);
    const tenantFlags = req.tenant ? await getTenantJson('feature_flags', req.tenant.id, {}) : {};
    return res.json({
      success: true,
      keys: FEATURE_KEYS,
      flags,
      matrix,
      tenantOverrides: tenantFlags && typeof tenantFlags === 'object' ? tenantFlags : {}
    });
  })
);

// POST /features — update the master flag set (platform staff only)
router.post(
  '/features',
  asyncHandler(async (req, res) => {
    if (!req.isSuperAdmin) throw httpError(403, 'Only AmyLearn platform staff can update feature flags.');
    const updates = req.body && (req.body.flags || req.body);
    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      throw httpError(400, 'Provide a flags object to update.');
    }
    const flags = await readFlags();
    Object.keys(updates).forEach((key) => {
      if (FEATURE_KEYS.includes(key) && typeof updates[key] === 'boolean') flags[key] = updates[key];
    });
    await setJson(FLAGS_KEY, flags);
    return res.json({ success: true, message: 'Feature flags updated.', flags });
  })
);

// GET /dashboard/menu — role-filtered menu for the signed-in user
router.get(
  '/dashboard/menu',
  asyncHandler(async (req, res) => {
    if (!req.user) throw httpError(401, 'Authentication required. Please sign in.');
    const role = req.frontendRole || req.role;
    const overrides = req.tenant ? await getTenantJson('menu_overrides', req.tenant.id, {}) : {};
    const flags = await readFlags();
    const tenantFlags = req.tenant ? await getTenantJson('feature_flags', req.tenant.id, {}) : {};
    const merged = { ...flags, ...(tenantFlags && typeof tenantFlags === 'object' ? tenantFlags : {}) };
    const menu = getMenuForRole(role, overrides, merged);
    return res.json({ success: true, role, menu });
  })
);

module.exports = router;
