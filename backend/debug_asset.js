const mongoose = require('mongoose');
const Asset = require('./src/models/Asset');
// Mocking User model just in case reference is needed, though not needed for query
const User = require('./src/models/User'); // Ensure this exists or remove reference if not populated

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://BlockchainDRM:Saikrishna1789@cluster0.hkfme0m.mongodb.net/?appName=Cluster0');
        console.log('MongoDB Connected');

        const assetId = '696da5b7f03417484b923aef'; // ID from user error
        const asset = await Asset.findById(assetId).select('+encryptionKey +iv');

        console.log('Asset Found:', !!asset);
        if (asset) {
            console.log('ID:', asset._id);
            console.log('Title:', asset.title);
            console.log('Encryption Key:', asset.encryptionKey);
            console.log('IV:', asset.iv);
            console.log('Storage Path:', asset.storagePath);
            console.log('Original File Name:', asset.originalFileName);
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        mongoose.connection.close();
    }
};

connectDB();
