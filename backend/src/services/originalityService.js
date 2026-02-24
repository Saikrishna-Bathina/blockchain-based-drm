const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Configuration for Originality Engine URLs (Assuming running locally on specific ports)
// Video: 5003, Text: 5002, Image: 8081, Audio: 8080
const ENGINES = {
    video: process.env.ENGINE_VIDEO_URL || 'http://localhost:5003',
    image: process.env.ENGINE_IMAGE_URL || 'http://localhost:8081',
    text: process.env.ENGINE_TEXT_URL || 'http://localhost:5002',
    audio: process.env.ENGINE_AUDIO_URL || 'http://localhost:8080'
};

exports.checkOriginality = async (filePath, contentType) => {
    try {
        const engineUrl = ENGINES[contentType];
        if (!engineUrl) {
            throw new Error(`No originality engine found for type: ${contentType}`);
        }

        const form = new FormData();
        const endpoint = '/check';
        const fileKey = 'file';

        form.append(fileKey, fs.createReadStream(filePath));

        // For now, simple interaction
        const response = await axios.post(`${engineUrl}${endpoint}`, form, {
            headers: {
                ...form.getHeaders()
            }
        });

        const data = response.data;
        let result = {
            is_original: false,
            score: 0,
            match_id: data.match_id || data.content_id || null, // Capture match ID
            details: data
        };

        // Normalize Response based on Content Type
        if (contentType === 'audio') {
            const similarity = data.top_score || 0;
            result.is_original = (data.status === "ORIGINAL");
            result.score = Math.max(0, 100 - similarity);
        }
        else if (contentType === 'image') {
            const distance = data.distance !== undefined ? data.distance : 100;
            result.is_original = (data.status === "ORIGINAL");
            result.score = Math.min(100, Math.round((distance / 32) * 100));
            if (distance === -1) result.score = 100;
        }
        else if (contentType === 'video') {
            result.is_original = (data.status === "Original");
            const visualSim = (data.visual_score || 0) * 100;
            const audioSim = data.audio_score || 0;
            const maxSim = Math.max(visualSim, audioSim);
            result.score = Math.max(0, 100 - maxSim);
        }
        else if (contentType === 'text') {
            const sim = (data.similarity_score || 0) * 100;
            result.is_original = (data.status === "Original");
            result.score = Math.max(0, 100 - sim);
        }

        return result;

    } catch (error) {
        console.error('Originality Check Error:', error.message);
        if (error.response) {
            console.error('Originality API Response:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('Originality API No Response:', error.request);
        }
        // Determine if we should fail hard or return a "check failed" status
        // For now, rethrow
        throw new Error('Originality check failed: ' + (error.response?.data?.error || error.message));
    }
};

exports.registerAsset = async (filePath, contentType, assetId) => {
    try {
        const engineUrl = ENGINES[contentType];
        if (!engineUrl) {
            console.warn(`No originality engine found for type: ${contentType}. Skipping registration.`);
            return;
        }

        const form = new FormData();
        const endpoint = '/register';

        form.append('file', fs.createReadStream(filePath));
        // Pass ID as both 'content_id' (Text) and 'label' (Audio/Image) to be compatible with all engines
        // audio_id logic handled here if assetId is just a string
        let audio_id = assetId;
        if (contentType === 'audio') {
            const zlib = require('zlib');
            audio_id = zlib.crc32(assetId) & 0xffffffff;
        }

        form.append('content_id', assetId);
        form.append('label', assetId);
        form.append('id', audio_id.toString());

        console.log(`[OriginalityService] Registering ${contentType} asset ${assetId} to ${engineUrl}${endpoint}`);

        const response = await axios.post(`${engineUrl}${endpoint}`, form, {
            headers: {
                ...form.getHeaders()
            }
        });

        console.log(`[OriginalityService] Registration successful:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`[OriginalityService] Failed to register ${contentType} asset:`, error.message);
        // Soft fail: Don't stop the workflow, just log.
    }
};
