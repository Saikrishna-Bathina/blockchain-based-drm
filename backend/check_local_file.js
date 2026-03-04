const mongoose = require('mongoose');
const Asset = require('./src/models/Asset');
const fs = require('fs');
const path = require('path');

const checkAsset = async () => {
    try {
        await mongoose.connect('mongodb+srv://BlockchainDRM:Saikrishna1789@cluster0.hkfme0m.mongodb.net/?appName=Cluster0');
        const assetId = '69a67f7565351107b53b8547';
        const asset = await Asset.findById(assetId);

        if (!asset) {
            console.log("Asset not found in DB");
            return;
        }

        console.log("Asset found in DB:", asset.title);
        console.log("Storage Path:", asset.storagePath);
        console.log("IPFS CID:", asset.cid);

        let filePath = asset.storagePath;
        if (!filePath.endsWith('.enc')) filePath += '.enc';

        const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, filePath);
        console.log("Full local path check:", absolutePath);

        if (fs.existsSync(absolutePath)) {
            console.log("✅ File exists locally!");
        } else {
            console.log("❌ File DOES NOT exist locally. This is why it's not loading on localhost.");
            console.log("If this asset was uploaded to Render, the file is only on Render.");
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        mongoose.connection.close();
    }
};

checkAsset();
