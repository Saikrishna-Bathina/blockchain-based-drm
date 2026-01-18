const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Configuration for Originality Engine URLs (Assuming running locally on specific ports)
// Video: 5003, Text: 5002, Image: 8081, Audio: 8080
const ENGINES = {
    video: 'http://localhost:5003',
    image: 'http://localhost:8081',
    text: 'http://localhost:5002',
    audio: 'http://localhost:8080'
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
            details: data
        };

        // Normalize Response based on Content Type
        if (contentType === 'audio') {
            // Audio: { status: "ORIGINAL" | "DUPLICATE", top_score: float }
            // PARTIAL_SCORE_THRESH = 35. If score >= 35 it is DUPLICATE.
            // So score logic: 0 = Safe, 100 = Duplicate. 
            // We want "Originality Score" -> Higher is better (more original) or Lower is better (less similar)?
            // Usually Originality Score means "How Original It Is". 
            // If data.top_score is "Similarity", then Originality = 100 - Similarity.

            const similarity = data.top_score || 0;
            result.is_original = (data.status === "ORIGINAL");
            result.score = Math.max(0, 100 - similarity); // Convert similarity to originality
        }
        else if (contentType === 'image') {
            // Image: { status: "ORIGINAL" | "DUPLICATE...", distance: int }
            // Distance 0 = Exact Match. Higher distance = More Original.
            // Threshold for duplicate is usually low (e.g. < 10).
            const distance = data.distance !== undefined ? data.distance : 100;

            // Heuristic for score: If distance > 50, it's very original (100%). If distance 0, 0%.
            result.is_original = (data.status === "ORIGINAL");
            // Simple mapping: min(100, distance * 2)
            // Updated: Scale distance 0-32 to 0-100 score. 
            // Distance 10 (Threshold) -> 31%. Distance 32+ -> 100%.
            result.score = Math.min(100, Math.round((distance / 32) * 100));
            if (distance === -1) result.score = 100; // No match found
        }
        else if (contentType === 'video') {
            // Video: { status: "Original" | "Duplicate...", audio_score, visual_score }
            // videoFiles/originality.py logic
            result.is_original = (data.status === "Original");

            // Composite score. data.visual_score is 0.0-1.0 (Similarity).
            // data.audio_score is 0-100 (Similarity).
            const visualSim = (data.visual_score || 0) * 100;
            const audioSim = data.audio_score || 0;
            const maxSim = Math.max(visualSim, audioSim);

            result.score = Math.max(0, 100 - maxSim);
        }
        else if (contentType === 'text') {
            // Text: { status: "Original" | "Duplicate", similarity_score: 0.0-1.0 }
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
        form.append('content_id', assetId);
        form.append('label', assetId);
        form.append('id', assetId);

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
