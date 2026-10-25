'use strict';

const router = require('express').Router();
const { prisma } = require('../config/prisma');
const { setTenantContext } = require('../middleware/authMiddleware');
const { getMenuForRole } = require('../config/masterFeatures');
const { getTenantJson } = require('../utils/systemConfig');
const { toUserDTO } = require('../utils/userDTO');
const { asyncHandler } = require('../utils/apiHelpers');

router.use(setTenantContext);

// GET /session/info — the signed-in identity plus tenant context
router.get(
  '/info',
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { studentProfiles: true, facultyProfiles: true }
    });
    return res.json({
      success: true,
      user: toUserDTO(user, { role: req.role, tenant: req.tenant, membership: req.membership }),
      tenant: req.tenant,
      role: req.frontendRole,
      isSuperAdmin: Boolean(req.isSuperAdmin),
      adminRoles: req.adminRoles || [],
      permissions: req.permissions || []
    });
  })
);

// GET /session/menu — role-filtered menu with tenant overrides
router.get(
  '/menu',
  asyncHandler(async (req, res) => {
    const overrides = req.tenant ? await getTenantJson('menu_overrides', req.tenant.id, {}) : {};
    const flags = await getTenantJson('feature_flags', req.tenant ? req.tenant.id : null, {});
    const menu = getMenuForRole(req.frontendRole || req.role, overrides, flags);
    return res.json({ success: true, role: req.frontendRole || req.role, menu });
  })
);

module.exports = router;
