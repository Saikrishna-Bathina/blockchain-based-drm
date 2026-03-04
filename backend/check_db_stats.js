const mongoose = require('mongoose');
const Asset = require('./src/models/Asset');
const License = require('./src/models/License');

const checkStats = async () => {
    try {
        await mongoose.connect('mongodb+srv://BlockchainDRM:Saikrishna1789@cluster0.hkfme0m.mongodb.net/?appName=Cluster0');

        const totalAssets = await Asset.countDocuments();
        const mintedAssets = await Asset.countDocuments({ blockchainId: { $exists: true, $ne: null, $ne: "PENDING" } });
        const totalLicenses = await License.countDocuments();

        console.log("Database Stats:");
        console.log("Total Assets:", totalAssets);
        console.log("Minted Assets:", mintedAssets);
        console.log("Total Licenses:", totalLicenses);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        mongoose.connection.close();
    }
};

checkStats();
