const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// Basic integration test script
// Run with: node test_api.js

const BASE_URL = 'http://localhost:5000/api/v1';
let token = '';
let assetId = '';

async function runTests() {
    console.log("Starting System Verification...");

    try {
        // 1. Register User
        console.log("\n1. Testing Registration...");
        const randomEmail = `test${Date.now()}@example.com`;
        try {
            const regRes = await axios.post(`${BASE_URL}/auth/register`, {
                username: "TestUser",
                email: randomEmail,
                password: "password123",
                role: "creator"
            });
            token = regRes.data.token;
            console.log("✅ Registration Successful. Token received.");
        } catch (e) {
            console.error("❌ Registration Failed:", e.response?.data || e.message);
            process.exit(1);
        }

        // 2. Upload Asset
        console.log("\n2. Testing Asset Upload...");
        const form = new FormData();
        form.append('title', 'Test Asset');
        form.append('description', 'This is a test asset for verification.');
        form.append('contentType', 'text');

        // Create a dummy file
        const dummyPath = path.join(__dirname, 'testfile.txt');
        fs.writeFileSync(dummyPath, 'Hello Blockchain DRM World!');
        form.append('file', fs.createReadStream(dummyPath));

        const licenseTerms = JSON.stringify({
            oneTimeWatchPrice: 10,
            timeBasedLicensePrice: 5,
            commercialLicensePrice: 100
        });
        form.append('licenseTerms', licenseTerms);

        try {
            const uploadRes = await axios.post(`${BASE_URL}/assets/upload`, form, {
                headers: {
                    ...form.getHeaders(),
                    'Authorization': `Bearer ${token}`
                }
            });
            assetId = uploadRes.data.data._id;
            console.log("✅ Upload Successful. Asset ID:", assetId);

            // Cleanup dummy
            fs.unlinkSync(dummyPath);
        } catch (e) {
            console.error("❌ Upload Failed:", e.response?.data || e.message);
            process.exit(1);
        }

        // 3. Get Asset Details
        console.log("\n3. Testing Get Asset Details...");
        try {
            const assetRes = await axios.get(`${BASE_URL}/assets/${assetId}`);
            if (assetRes.data.data.title === 'Test Asset') {
                console.log("✅ Get Asset Successful.");
            } else {
                throw new Error("Title mismatch");
            }
        } catch (e) {
            console.error("❌ Get Asset Failed:", e.response?.data || e.message);
        }

        // 4. Test Stream (Should fail without License/Owner check logic if we mock buyer, but we are owner so it should pass)
        console.log("\n4. Testing Stream (As Owner)...");
        try {
            // Note: Owner bypasses license check in our logic
            const streamRes = await axios.get(`${BASE_URL}/assets/${assetId}/stream`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log("✅ Stream Request Initiated (Status: " + streamRes.status + ")");
        } catch (e) {
            // It might return 206 or 200 depending on axios handling of streams
            if (e.response && (e.response.status === 200 || e.response.status === 206)) {
                console.log("✅ Stream Successful (Status: " + e.response.status + ")");
            } else {
                console.error("❌ Stream Failed:", e.response?.data || e.message);
            }
        }

        console.log("\n✅ Verification Complete!");

    } catch (err) {
        console.error("Unexpected Error:", err);
    }
}

runTests();
