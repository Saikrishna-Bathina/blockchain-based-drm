const License = require('../models/License');

const Asset = require('../models/Asset');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ethers } = require('ethers');

// CONSTANTS (Ideally move to env/config)
const DRM_LICENSING_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const DRMLicensingABI = [
    "function checkLicense(address user, uint256 tokenId) public view returns (bool)"
];

// Assuming decryptFile is a helper
const decryptFile = async (inputPath, key, iv, outputPath) => {
    return new Promise((resolve, reject) => {
        const algorithm = 'aes-256-cbc';
        const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
        const input = fs.createReadStream(inputPath);
        const output = fs.createWriteStream(outputPath);

        input.pipe(decipher).pipe(output);

        output.on('finish', resolve);
        decipher.on('error', reject);
    });
};

const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";

// Helper for logging
const logError = (msg, err) => {
    const logPath = path.join(__dirname, '../../backend_error.log');
    const logEntry = `[${new Date().toISOString()}] ${msg}: ${err ? err.stack || err : ''}\n`;
    try {
        fs.appendFileSync(logPath, logEntry);
    } catch (e) {
        console.error("Failed to write to log file:", e);
    }
};

// @desc    Stream secure content
// @route   GET /api/v1/assets/:id/stream
// @access  Private (Needs License Check)
exports.streamAsset = async (req, res, next) => {
    try {
        console.log(`Stream Asset Request: ID=${req.params.id}, User=${req.user ? req.user.id : 'Guest'}`);
        const asset = await Asset.findById(req.params.id).select('+encryptionKey +iv');
        if (!asset) {
            return res.status(404).json({ success: false, error: 'Asset not found' });
        }

        // Skip check if owner
        if (asset.owner.toString() !== req.user.id) {
            // 1. Verify User License on Blockchain OR Database
            if (!req.user || !req.user.walletAddress) {
                // ... (debug logs)
                return res.status(401).json({ success: false, error: 'User wallet not connected' });
            }

            // A. Check Local License Database (Fast & Supports Expiry)
            const localLicense = await License.findOne({ user: req.user.id, asset: asset._id, active: true });

            if (localLicense) {
                // Check Expiry
                if (localLicense.expiryTime && new Date() > new Date(localLicense.expiryTime)) {
                    return res.status(403).json({ success: false, error: 'License Expired. Please renew.' });
                }
                // Valid License found in DB -> Proceed to Stream
            } else {
                // B. Fallback to Blockchain (Slow, Lifetime only if not synced)
                try {
                    const provider = new ethers.JsonRpcProvider(RPC_URL);
                    const contract = new ethers.Contract(DRM_LICENSING_ADDRESS, DRMLicensingABI, provider);

                    if (!asset.blockchainId) {
                        return res.status(403).json({ success: false, error: 'Asset not minted on blockchain' });
                    }

                    const hasLicense = await contract.checkLicense(req.user.walletAddress, asset.blockchainId);

                    if (!hasLicense) {
                        return res.status(403).json({ success: false, error: 'No valid license found on blockchain or local DB' });
                    }
                } catch (bcError) {
                    console.error("Blockchain verification failed:", bcError);
                    return res.status(500).json({ success: false, error: 'License verification failed' });
                }
            }
        }

        // 2. Encryption path
        let encryptedPath = asset.storagePath;
        if (!encryptedPath || !fs.existsSync(encryptedPath)) {
            // Fallback for demo data
            const uploadsDir = path.join(__dirname, '../../uploads');
            return res.status(404).json({ success: false, error: 'Encrypted file not found on disk' });
        }

        if (!encryptedPath.endsWith('.enc')) {
            encryptedPath += '.enc';
        }

        if (!fs.existsSync(encryptedPath)) {
            return res.status(404).json({ success: false, error: 'Encrypted file source not found' });
        }

        // 3. Decryption Target (Temp)
        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

        const decryptedPath = path.join(tempDir, `stream-${asset._id}${path.extname(asset.originalFileName)}`);

        // Check if already decrypted and exists
        if (!fs.existsSync(decryptedPath)) {
            try {
                await decryptFile(encryptedPath, asset.encryptionKey, asset.iv, decryptedPath);
            } catch (decErr) {
                console.error("Decryption error:", decErr);
                fs.appendFileSync('backend_error.log', `[${new Date().toISOString()}] Decryption Error: ${decErr.stack}\n`);
                return res.status(500).json({ success: false, error: 'Decryption failed' });
            }
        }

        // 4. Serve Request (Handle Range or Watermark)
        const stat = fs.statSync(decryptedPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        // Experimental: Watermarking using ffmpeg
        const useWatermark = req.query.watermark === 'true' && asset.contentType === 'video';

        if (useWatermark) {
            try {
                const ffmpeg = require('fluent-ffmpeg');
                console.log("Starting watermarked stream for: " + req.user.walletAddress);

                res.contentType('video/mp4');
                // We can't set Content-Length for transcoding Stream
                // Note: This disables seeking in most players

                const walletShort = req.user.walletAddress.substring(0, 8);

                ffmpeg(decryptedPath)
                    .videoFilters({
                        filter: 'drawtext',
                        options: {
                            text: `Licensed to ${walletShort}...`,
                            fontsize: 24,
                            fontcolor: 'white',
                            x: '10',
                            y: 'h-th-10', // Bottom Left
                            box: 1,
                            boxcolor: 'black@0.5',
                            alpha: 0.7
                        }
                    })
                    // Ensure output format and fast start
                    .format('mp4')

                    .outputOptions([
                        '-preset ultrafast', // Low latency
                        '-movflags frag_keyframe+empty_moov'
                    ])
                    .on('error', (err) => {
                        console.error('FFmpeg parsing error: ' + err.message);
                        // Do not verify streaming headers sentState here as ffmpeg might stream partial
                    })
                    .pipe(res, { end: true });
            } catch (ffmpegErr) {
                console.error("FFmpeg Not Found/Error:", ffmpegErr);
                // Fallback to standard stream
                res.status(500).json({ error: "Watermarking service unavailable" });
            }



        } else {
            // Standard Range Streaming (Seekable)
            if (range) {
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                const chunksize = (end - start) + 1;
                const file = fs.createReadStream(decryptedPath, { start, end });

                const ext = path.extname(asset.originalFileName).toLowerCase();
                let contentType = 'application/octet-stream';

                if (asset.contentType === 'video') contentType = 'video/mp4';
                else if (asset.contentType === 'audio') contentType = 'audio/mpeg';
                else if (asset.contentType === 'image') {
                    if (ext === '.png') contentType = 'image/png';
                    else if (ext === '.gif') contentType = 'image/gif';
                    else if (ext === '.webp') contentType = 'image/webp';
                    else contentType = 'image/jpeg';
                }
                else if (asset.contentType === 'text') {
                    if (ext === '.pdf') contentType = 'application/pdf';
                    else contentType = 'text/plain';
                }

                const head = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': contentType,
                    'Cross-Origin-Resource-Policy': 'cross-origin', // Allow embedding
                    'Access-Control-Allow-Origin': '*'
                };
                res.writeHead(206, head);
                file.pipe(res);
            } else {
                const ext = path.extname(asset.originalFileName).toLowerCase();
                let contentType = 'application/octet-stream';

                if (asset.contentType === 'video') contentType = 'video/mp4';
                else if (asset.contentType === 'audio') contentType = 'audio/mpeg';
                else if (asset.contentType === 'image') {
                    if (ext === '.png') contentType = 'image/png';
                    else if (ext === '.gif') contentType = 'image/gif';
                    else if (ext === '.webp') contentType = 'image/webp';
                    else contentType = 'image/jpeg';
                }
                else if (asset.contentType === 'text') {
                    if (ext === '.pdf') contentType = 'application/pdf';
                    else contentType = 'text/plain';
                }

                const head = {
                    'Content-Length': fileSize,
                    'Content-Type': contentType,
                    'Cross-Origin-Resource-Policy': 'cross-origin', // Allow embedding
                    'Access-Control-Allow-Origin': '*'
                };
                res.writeHead(200, head);
                fs.createReadStream(decryptedPath).pipe(res);
            }
        }

    } catch (err) {
        console.error("Streaming error:", err);
        logError("Streaming Error", err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
};
