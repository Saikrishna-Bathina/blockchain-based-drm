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

        const { createNotification } = require('../services/notificationService');
        await createNotification(req.user.id, 'purchase', 'License Purchased', `Acquired "${licenseType}" for asset "${asset.title}".`, { assetId: assetId, transactionHash });

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

// @desc    Get license stats (sales & revenue) for my assets
// @route   GET /api/v1/licenses/stats
// @access  Private
exports.getLicenseStats = async (req, res, next) => {
    try {
        // 1. Find all assets owned by user
        const assets = await Asset.find({ owner: req.user.id });
        const assetIds = assets.map(a => a._id);


        if (assetIds.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    totalLicensesSold: 0,
                    totalRevenue: 0,
                    salesByAsset: []
                }
            });
        }

        // 2. Find all licenses for these assets
        const licenses = await License.find({ asset: { $in: assetIds } }).populate('asset');

        // 3. Calculate Stats
        let totalRevenue = 0;
        const salesByAsset = {};

        licenses.forEach(license => {
            const asset = license.asset;
            if (!asset) return; // Guard against null asset

            const term = asset.licenseTerms && asset.licenseTerms[license.licenseType];

            if (term && term.price) {
                const price = parseFloat(term.price);
                if (!isNaN(price)) {
                    totalRevenue += price;
                }
            }

            if (!salesByAsset[asset._id]) {
                salesByAsset[asset._id] = {
                    title: asset.title,
                    count: 0,
                    revenue: 0
                };
            }
            salesByAsset[asset._id].count++;
            if (term && term.price) {
                salesByAsset[asset._id].revenue += parseFloat(term.price);
            }
        });


        res.status(200).json({
            success: true,
            data: {
                totalLicensesSold: licenses.length,
                totalRevenue: totalRevenue.toFixed(4), // ETH usually has decimals
                salesByAsset: Object.values(salesByAsset)
            }
        });

    } catch (err) {
        console.error("Get License Stats Error:", err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get public platform stats
// @route   GET /api/v1/licenses/public-stats
// @access  Public
exports.getPlatformStats = async (req, res, next) => {
    try {
        const totalAssets = await Asset.countDocuments();
        const totalLicenses = await License.countDocuments();

        // Calculate Total Revenue
        // Ideally this should be an aggregation, but for now we iterate to sum prices
        const licenses = await License.find().populate('asset');
        let totalRevenue = 0;

        licenses.forEach(license => {
            const asset = license.asset;
            if (asset) {
                const term = asset.licenseTerms && asset.licenseTerms[license.licenseType];
                if (term && term.price) {
                    totalRevenue += parseFloat(term.price) || 0;
                }
            }
        });

        res.status(200).json({
            success: true,
            data: {
                totalAssets,
                totalLicenses,
                totalRevenue: totalRevenue.toFixed(2)
            }
        });

    } catch (err) {
        console.error("Get Platform Stats Error:", err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
// @desc    Get real-time blockchain analytics
// @route   GET /api/v1/licenses/blockchain-stats
// @access  Public
exports.getBlockchainStats = async (req, res, next) => {
    try {
        const { ethers } = require('ethers');
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://127.0.0.1:8545");

        const registryAddr = process.env.DRM_REGISTRY_ADDRESS || "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";
        const licensingAddr = process.env.DRM_LICENSING_ADDRESS || "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";

        const registry = new ethers.Contract(registryAddr, [
            "function totalSupply() public view returns (uint256)"
        ], provider);

        const licensing = new ethers.Contract(licensingAddr, [
            "function totalLicensesPurchased() public view returns (uint256)"
        ], provider);

        let totalMinted = 0;
        let totalSales = 0;

        try {
            totalMinted = await registry.totalSupply();
            totalSales = await licensing.totalLicensesPurchased();
        } catch (e) {
            console.error("Blockchain Stats Fetch Error (RPC likely busy):", e.message);
            // We keep totalMinted/totalSales as 0 and continue to return DB stats
        }

        // Combine with DB stats for rich data
        const totalAssets = await Asset.countDocuments();
        const originalAssets = await Asset.countDocuments({ originalityVerified: true });

        res.status(200).json({
            success: true,
            data: {
                blockchain: {
                    totalMinted: Number(totalMinted),
                    totalSales: Number(totalSales)
                },
                database: {
                    totalAssets,
                    originalAssets
                }
            }
        });
    } catch (err) {
        console.error("Get Blockchain Stats Error:", err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
