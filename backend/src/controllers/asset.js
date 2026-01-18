const Asset = require('../models/Asset');
const { checkOriginality, registerAsset } = require('../services/originalityService');
const { encryptFile } = require('../services/encryptionService');
const { uploadToIPFS } = require('../services/ipfsService');
const fs = require('fs');
const path = require('path');

// @desc    Upload new asset
// @route   POST /api/v1/assets/upload
// @access  Private
exports.uploadAsset = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Please upload a file' });
        }

        const { title, description, contentType, licenseTerms } = req.body;

        let parsedLicenseTerms = {};
        try {
            parsedLicenseTerms = typeof licenseTerms === 'string' ? JSON.parse(licenseTerms) : licenseTerms;
        } catch (e) {
            parsedLicenseTerms = {};
        }

        const asset = await Asset.create({
            title,
            description,
            contentType,
            originalFileName: req.file.originalname,
            storagePath: req.file.path,
            owner: req.user.id,
            licenseTerms: parsedLicenseTerms,
            originalityVerified: false
        });

        res.status(201).json({
            success: true,
            data: asset,
            message: "File uploaded successfully. Proceed to verification."
        });

    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Verify Originality
// @route   PUT /api/v1/assets/:id/verify
// @access  Private
exports.verifyOriginality = async (req, res, next) => {
    try {
        const asset = await Asset.findById(req.params.id);
        if (!asset) return res.status(404).json({ success: false, error: 'Asset not found' });

        if (asset.owner.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        console.log(`Verifying Asset: ${asset._id} (${asset.contentType})`);

        let originalityResult;
        try {
            originalityResult = await checkOriginality(asset.storagePath, asset.contentType);

            asset.originalityVerified = originalityResult.is_original || false;
            asset.originalityScore = originalityResult.score || 0;
            asset.originalityReport = originalityResult;

            // If Original, Register it in the Engine!
            if (asset.originalityVerified) {
                console.log(`[Asset Controller] Auto-registering original asset ${asset._id} with engine...`);
                // Run in background? Or await? User said "you need to register".
                // Let's await to be safe, though it adds latency. 
                // Given the flow is granular now, a bit of latency is fine.
                await registerAsset(asset.storagePath, asset.contentType, asset._id.toString());
            }

        } catch (err) {
            console.error("Verification failed", err);
            return res.status(500).json({ success: false, error: "Originality Check Failed" });
        }

        await asset.save();

        res.status(200).json({
            success: true,
            data: asset,
            message: asset.originalityVerified ? "Asset Verified Original." : "Asset Flagged as Duplicate."
        });

    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Secure Asset (Encrypt & IPFS)
// @route   PUT /api/v1/assets/:id/secure
// @access  Private
exports.secureAsset = async (req, res, next) => {
    try {
        const asset = await Asset.findById(req.params.id);
        if (!asset) return res.status(404).json({ success: false, error: 'Asset not found' });

        if (asset.owner.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        if (!asset.originalityVerified) {
            return res.status(400).json({ success: false, error: 'Cannot secure duplicate asset' });
        }

        if (asset.cid) {
            return res.status(200).json({ success: true, data: asset, message: 'Already secured' });
        }

        console.log(`Securing Asset: ${asset._id}`);

        const encryptedPath = asset.storagePath + '.enc';

        try {
            const encryptionData = await encryptFile(asset.storagePath, encryptedPath);
            asset.encryptionKey = encryptionData.key;
            asset.iv = encryptionData.iv;

            const cid = await uploadToIPFS(encryptedPath);
            asset.cid = cid;

            if (fs.existsSync(encryptedPath)) fs.unlinkSync(encryptedPath);
        } catch (err) {
            if (fs.existsSync(encryptedPath)) fs.unlinkSync(encryptedPath);
            return res.status(500).json({ success: false, error: "Encryption/IPFS Failed: " + err.message });
        }

        await asset.save();

        // Cleanup Original File to save space? 
        // Typically we might keep it for streaming until deletion, but requirement said "Upload into IPFS"
        // Let's keep local file for now as 'storagePath' is used for streaming by backend maybe? 
        // (Stream endpoint is not fully implemented for encrypted files yet likely)

        res.status(200).json({ success: true, data: asset });

    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all assets (Marketplace)
// @route   GET /api/v1/assets
// @access  Public
exports.getAssets = async (req, res, next) => {
    try {
        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit', 'showAll'];

        // Loop over removeFields and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query string
        let queryStr = JSON.stringify(reqQuery);

        // Create operators ($gt, $gte, etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        // Finding resource
        let queryObj = JSON.parse(queryStr);

        // Ensure we only show verified assets by default
        if (!req.query.showAll) {
            queryObj.originalityVerified = true;
        }

        // Search functionality
        if (req.query.search) {
            queryObj.title = { $regex: req.query.search, $options: 'i' };
            delete queryObj.search;
        }

        query = Asset.find(queryObj).populate('owner', 'username walletAddress');

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Asset.countDocuments(queryObj);

        query = query.skip(startIndex).limit(limit);

        // Executing query
        const assets = await query;

        res.status(200).json({ success: true, count: assets.length, pagination: { total, page, limit }, data: assets });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single asset
// @route   GET /api/v1/assets/:id
// @access  Public
exports.getAsset = async (req, res, next) => {
    try {
        const asset = await Asset.findById(req.params.id).populate('owner', 'username walletAddress');
        if (!asset) {
            return res.status(404).json({ success: false, error: 'Asset not found' });
        }
        res.status(200).json({ success: true, data: asset });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update asset with Blockchain ID (Token ID)
// @route   PUT /api/v1/assets/:id/mint
// @access  Private
exports.updateBlockchainId = async (req, res, next) => {
    try {
        const { blockchainId, transactionHash } = req.body;

        const asset = await Asset.findById(req.params.id);

        if (!asset) {
            return res.status(404).json({ success: false, error: 'Asset not found' });
        }

        // Ensure user is owner
        if (asset.owner.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        asset.blockchainId = blockchainId;
        // We could also store txHash if we update the model

        await asset.save();

        res.status(200).json({ success: true, data: asset });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
