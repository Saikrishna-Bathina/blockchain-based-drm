const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Connect to local IPFS node, or use Infura/Pinata if configured
// For this demo, we assume a local IPFS daemon is running or we mock it if not available.
// If user doesn't have IPFS running, this might fail. We should handle that.
// Let's try to connect to localhost:5001 (default API port)


exports.uploadToIPFS = async (filePath) => {
    try {
        const pinataApiKey = process.env.PINATA_API_KEY;
        const pinataSecretKey = process.env.PINATA_SECRET_KEY;

        if (pinataApiKey && pinataSecretKey) {
            // Use Pinata
            const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
            let data = new FormData();
            data.append('file', fs.createReadStream(filePath));

            const response = await axios.post(url, data, {
                maxBodyLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                    'pinata_api_key': pinataApiKey,
                    'pinata_secret_api_key': pinataSecretKey
                }
            });

            return response.data.IpfsHash;

        } else {
            console.warn("No Pinata keys found. Using Simulated IPFS for demo.");
            // Fallback for demo/dev without running IPFS node
            return "QmSimulatedIPFSHash" + Date.now().toString();
        }

    } catch (error) {
        console.error("IPFS Upload Error:", error.message);
        throw error;
    }
};
