const express = require('express');
const { syncLicense, getMyLicenses } = require('../controllers/license');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/sync', syncLicense);
router.get('/me', getMyLicenses);

module.exports = router;
