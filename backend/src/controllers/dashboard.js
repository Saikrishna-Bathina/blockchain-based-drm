const Asset = require('../models/Asset');
const License = require('../models/License');
const Notification = require('../models/Notification');

// @desc    Get dashboard stats
// @route   GET /api/v1/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
    try {
        // 1. Total Assets (All)
        const totalAssets = await Asset.countDocuments();

        // 2. Blockchain Minted (DB check for blockchainId presence)
        const mintedAssets = await Asset.countDocuments({ blockchainId: { $exists: true, $ne: null, $ne: "PENDING" } });

        // 3. Licenses Sold (All)
        const totalLicenses = await License.countDocuments();

        // 4. Calculate Total Revenue (Sum of license price in ETH)
        // We iterate through licenses and match with asset terms
        const licenses = await License.find().populate('asset');
        let totalRevenue = 0;

        licenses.forEach(license => {
            if (license.asset) {
                const term = license.asset.licenseTerms && license.asset.licenseTerms[license.licenseType];
                if (term && term.price) {
                    totalRevenue += parseFloat(term.price) || 0;
                }
            }
        });

        // 5. Recent Activity (from Notifications)
        const recentActivity = await Notification.find({ user: req.user.id })
            .sort('-createdAt')
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                totalAssets,
                mintedAssets,
                totalLicenses,
                totalRevenue: totalRevenue.toFixed(4),
                recentActivity
            }
        });

    } catch (err) {
        console.error("Dashboard Stats Error:", err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
