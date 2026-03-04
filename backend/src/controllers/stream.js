const License = require('../models/License');
const Asset = require('../models/Asset');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const { getDecipher } = require('../services/encryptionService');
const { getIPFSStream } = require('../services/ipfsService');

// CONSTANTS
const DRM_LICENSING_ADDRESS = process.env.DRM_LICENSING_ADDRESS || "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";
const DRMLicensingABI = [
    "function checkLicense(address user, uint256 tokenId) public view returns (bool)"
];
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const STREAM_SECRET = process.env.JWT_SECRET || 'your_stream_secret_key';

// @desc    Generate a short-lived stream token
// @route   GET /api/v1/assets/:id/token
// @access  Private
exports.getStreamToken = async (req, res, next) => {
    try {
        const asset = await Asset.findById(req.params.id);
        if (!asset) {
            return res.status(404).json({ success: false, error: 'Asset not found' });
        }

        // Check if user has license (Owner or Buyer)
        let hasAccess = asset.owner.toString() === req.user.id;

        if (!hasAccess) {
            const license = await License.findOne({ user: req.user.id, asset: asset._id, active: true });
            if (license) {
                if (!license.expiryTime || new Date() < new Date(license.expiryTime)) {
                    hasAccess = true;
                }
            }
        }

        // Blockchain Fallback
        if (!hasAccess && asset.blockchainId && asset.blockchainId !== "PENDING") {
            try {
                const User = require('../models/User');
                const user = await User.findById(req.user.id);

                if (user && user.walletAddress) {
                    const provider = new ethers.JsonRpcProvider(RPC_URL);
                    const contract = new ethers.Contract(DRM_LICENSING_ADDRESS, DRMLicensingABI, provider);

                    const onChainAccess = await contract.checkLicense(user.walletAddress, asset.blockchainId);
                    if (onChainAccess) {
                        hasAccess = true;

                        // Proactively sync to DB for next time (Optional but good)
                        try {
                            await License.create({
                                user: req.user.id,
                                asset: asset._id,
                                transactionHash: `fallback-${Date.now()}`, // Placeholder hash
                                licenseType: 'license1', // Default or detected?
                                active: true
                            });
                        } catch (syncErr) { console.error("Auto-sync failed:", syncErr.message); }
                    }
                }
            } catch (blockchainErr) {
                console.error("Blockchain Fallback Check Failed:", blockchainErr.message);
            }
        }

        if (!hasAccess) {
            return res.status(403).json({ success: false, error: 'No valid license to stream this asset' });
        }

        // Generate Token (Valid for 1 Hour)
        const token = jwt.sign(
            { id: asset._id, userId: req.user.id },
            STREAM_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            success: true,
            token
        });

    } catch (err) {
        console.error("Token Generation Error:", err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Stream secure content
// @route   GET /api/v1/assets/:id/stream?token=...
// @access  Public (Token protected)
exports.streamAsset = async (req, res, next) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(401).json({ success: false, error: 'Stream token missing' });
        }

        // 1. Verify Token
        let decoded;
        try {
            decoded = jwt.verify(token, STREAM_SECRET);
            if (decoded.id !== req.params.id) {
                return res.status(401).json({ success: false, error: 'Invalid stream token for this asset' });
            }
        } catch (jwtErr) {
            return res.status(401).json({ success: false, error: 'Stream token expired or invalid' });
        }

        // 2. Fetch Asset & Encryption Keys
        const asset = await Asset.findById(req.params.id).select('+encryptionKey +iv');
        if (!asset) {
            return res.status(404).json({ success: false, error: 'Asset not found' });
        }

        // 3. Prep File Stream
        let filePath = asset.storagePath;
        if (!filePath.endsWith('.enc')) filePath += '.enc';

        // Convert to absolute path for reliable existence check
        const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '../../', filePath);

        let fileStream;
        if (fs.existsSync(absolutePath)) {
            console.log(`Streaming local file: ${absolutePath}`);
            fileStream = fs.createReadStream(absolutePath);
        } else if (asset.cid) {
            console.log(`Local file missing at ${absolutePath}, falling back to IPFS for CID: ${asset.cid}`);
            try {
                fileStream = await getIPFSStream(asset.cid);
            } catch (ipfsErr) {
                return res.status(404).json({ success: false, error: 'File not found locally or on IPFS' });
            }
        } else {
            return res.status(404).json({ success: false, error: 'Secured file not found on server and no IPFS fallback available' });
        }

        const ext = path.extname(asset.originalFileName).toLowerCase();
        let contentType = asset.contentType === 'video' ? 'video/mp4' :
            asset.contentType === 'audio' ? 'audio/mpeg' :
                asset.contentType === 'image' ? 'image/jpeg' : 'application/octet-stream';

        const head = {
            'Content-Type': contentType,
            'Cross-Origin-Resource-Policy': 'cross-origin',
            'Access-Control-Allow-Origin': '*'
        };

        // Decipher Piping
        const decipher = getDecipher(asset.encryptionKey, asset.iv);

        // Watermark logic (Video Only)
        const useWatermark = req.query.watermark === 'true' && asset.contentType === 'video';

        if (useWatermark) {
            const ffmpeg = require('fluent-ffmpeg');
            res.writeHead(200, head);

            ffmpeg(fileStream.pipe(decipher))
                .videoFilters({
                    filter: 'drawtext',
                    options: {
                        text: `Licensed Secure Content`,
                        fontsize: 20,
                        fontcolor: 'white',
                        x: 'w-tw-10',
                        y: '10',
                        box: 1,
                        boxcolor: 'black@0.4',
                        alpha: 0.5
                    }
                })
                .format('mp4')
                .outputOptions(['-preset ultrafast', '-movflags frag_keyframe+empty_moov'])
                .on('error', (err) => console.error('FFmpeg Stream Error:', err.message))
                .pipe(res, { end: true });
        } else {
            res.writeHead(200, head);
            fileStream.pipe(decipher).pipe(res);
        }

    } catch (err) {
        console.error("Decrypted Streaming Error:", err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: 'Streaming failed' });
        }
    }
};
