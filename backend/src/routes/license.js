const express = require('express');
const { syncLicense, getMyLicenses, getLicenseStats, getPlatformStats, getBlockchainStats } = require('../controllers/license');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public Routes
router.get('/public-stats', getPlatformStats);
router.get('/blockchain-stats', getBlockchainStats);

router.use(protect);

router.post('/sync', syncLicense);
router.get('/stats', getLicenseStats);
router.get('/me', getMyLicenses);

module.exports = router;
