const License = require('../models/License');
const Asset = require('../models/Asset');
const User = require('../models/User');

// @desc    Sync license purchase from Blockchain to DB
// @route   POST /api/v1/licenses/sync
// @access  Private
exports.syncLicense = async (req, res, next) => {
    try {
        const { assetId, transactionHash, licenseType } = req.body;

        if (!assetId || !transactionHash || !licenseType) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        // Check availability
        const asset = await Asset.findById(assetId);
        if (!asset) {
            return res.status(404).json({ success: false, error: 'Asset not found' });
        }

        // Calculate Expiry
        let expiryTime = null;

        // Hardcoded Logic based on License Config
        // Video License 2 = 24 Hours
        // Audio License 2 = 24 Hours
        // Image License 2 = 24 Hours

        if (licenseType === 'license2') {
            // 24 Hours from now
            expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
        }

        // Create License Record
        const license = await License.create({
            user: req.user.id,
            asset: assetId,
            transactionHash,
            licenseType,
            expiryTime
        });

        res.status(201).json({
            success: true,
            data: license
        });

    } catch (err) {
        console.error("License Sync Error:", err);
        if (err.code === 11000) {
            return res.status(400).json({ success: false, error: 'License already recorded for this transaction' });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get my licenses
// @route   GET /api/v1/licenses/me
// @access  Private
exports.getMyLicenses = async (req, res, next) => {
    try {
        const licenses = await License.find({ user: req.user.id }).populate('asset');

        res.status(200).json({
            success: true,
            count: licenses.length,
            data: licenses
        });
    } catch (err) {
        console.error("Get Licenses Error:", err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
