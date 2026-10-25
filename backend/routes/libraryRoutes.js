'use strict';

const router = require('express').Router();
const { setTenantContext } = require('../middleware/authMiddleware');
const library = require('../controllers/libraryController');

router.use(setTenantContext);

// Digital vault
router.get('/digital', library.listDigital);
router.post('/digital/resource', library.addDigitalResource);
router.put('/digital/resource/:id/status', library.updateDigitalResourceStatus);
router.put('/digital/resource/:id', library.updateDigitalResource);
router.delete('/digital/resource/:id', library.deleteDigitalResource);
router.put('/digital/credential', library.upsertCredential);
router.delete('/digital/credential', library.deleteCredential);

// Physical circulation
router.get('/physical', library.listPhysical);
router.get('/physical/user/:identifier', library.physicalUser);
router.get('/physical/copy/:copyId', library.copyDetails);
router.post('/physical/checkout', library.checkout);
router.post('/physical/return', library.returnBook);
router.delete('/physical/copy/:copyId', library.deleteCopy);

module.exports = router;
