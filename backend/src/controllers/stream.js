const License = require('../models/License');
const Asset = require('../models/Asset');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const { getDecipher } = require('../services/encryptionService');

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

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, error: 'Secured file not found on server' });
        }

        const stat = fs.statSync(filePath);
        const fileSize = stat.size; // This is the encrypted size
        const range = req.headers.range;

        const ext = path.extname(asset.originalFileName).toLowerCase();
        let contentType = asset.contentType === 'video' ? 'video/mp4' :
            asset.contentType === 'audio' ? 'audio/mpeg' :
                asset.contentType === 'image' ? 'image/jpeg' : 'application/octet-stream';

        // NOTE: Standard range streaming with decryption is complex. 
        // For simplicity, we stream the FULL decrypted file for most types.
        // For production, one would typically use HLS with encrypted segments.

        const head = {
            'Content-Type': contentType,
            'Cross-Origin-Resource-Policy': 'cross-origin',
            'Access-Control-Allow-Origin': '*'
        };

        // Decipher Piping
        const decipher = getDecipher(asset.encryptionKey, asset.iv);
        const fileStream = fs.createReadStream(filePath);

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
