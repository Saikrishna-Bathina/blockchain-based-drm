const fs = require('fs');
const path = require('path');
const Asset = require('../models/Asset');
const { decryptFile } = require('../services/encryptionService');
const { ethers } = require('ethers');
const DRMLicensingABI = require('../abi/DRMLicensing.json');

// Contract Address (Ideally from .env)
const DRM_LICENSING_ADDRESS = process.env.DRM_LICENSING_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";

// @desc    Stream secure content
// @route   GET /api/v1/assets/:id/stream
// @access  Private (Needs License Check)
exports.streamAsset = async (req, res, next) => {
    try {
        const asset = await Asset.findById(req.params.id).select('+encryptionKey +iv');
        if (!asset) {
            return res.status(404).json({ success: false, error: 'Asset not found' });
        }

        // 1. Verify User License on Blockchain
        if (!req.user || !req.user.walletAddress) {
            return res.status(401).json({ success: false, error: 'User wallet not connected' });
        }

        // Skip check if owner
        if (asset.owner.toString() !== req.user.id) {
            try {
                const provider = new ethers.JsonRpcProvider(RPC_URL);
                const contract = new ethers.Contract(DRM_LICENSING_ADDRESS, DRMLicensingABI, provider);

                if (!asset.blockchainId) {
                    return res.status(403).json({ success: false, error: 'Asset not minted on blockchain' });
                }

                const hasLicense = await contract.checkLicense(req.user.walletAddress, asset.blockchainId);

                if (!hasLicense) {
                    return res.status(403).json({ success: false, error: 'No valid license found on blockchain' });
                }
            } catch (bcError) {
                console.error("Blockchain verification failed:", bcError);
                return res.status(500).json({ success: false, error: 'License verification failed' });
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
                            x: 10,
                            y: 10,
                            box: 1,
                            boxcolor: 'black@0.5'
                        }
                    })
                    .format('mp4')
                    .movflags('frag_keyframe+empty_moov')
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

                const head = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': asset.contentType === 'video' ? 'video/mp4' : (asset.contentType === 'audio' ? 'audio/mpeg' : 'application/octet-stream'),
                };
                res.writeHead(206, head);
                file.pipe(res);
            } else {
                const head = {
                    'Content-Length': fileSize,
                    'Content-Type': asset.contentType === 'video' ? 'video/mp4' : (asset.contentType === 'audio' ? 'audio/mpeg' : 'application/octet-stream'),
                };
                res.writeHead(200, head);
                fs.createReadStream(decryptedPath).pipe(res);
            }
        }

    } catch (err) {
        console.error("Streaming error:", err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
};
