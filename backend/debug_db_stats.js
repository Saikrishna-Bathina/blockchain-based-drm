const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Asset = require('./src/models/Asset');
const License = require('./src/models/License');

// Load env vars
dotenv.config({ path: './.env' });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // Use the owner ID found in previous step
        const userId = "696c99f7ace6b7de4a776a0c";
        console.log(`Testing stats for user: ${userId}`);

        // 1. Find assets
        const assets = await Asset.find({ owner: userId });
        const assetIds = assets.map(a => a._id);
        console.log(`Found ${assets.length} assets.`);

        if (assetIds.length === 0) {
            console.log("No assets.");
            process.exit();
        }

        // 2. Find licenses
        const licenses = await License.find({ asset: { $in: assetIds } }).populate('asset');
        console.log(`Found ${licenses.length} licenses.`);

        // 3. Calculate Stats
        let totalRevenue = 0;
        const salesByAsset = {};

        licenses.forEach(license => {
            const asset = license.asset;
            if (!asset) {
                console.log("Found license with null asset:", license._id);
                return;
            }

            const term = asset.licenseTerms && asset.licenseTerms[license.licenseType];

            if (term && term.price) {
                const price = parseFloat(term.price);
                if (!isNaN(price)) {
                    totalRevenue += price;
                }
            }

            // Potential crash point if logic is wrong?
            if (!salesByAsset[asset._id]) {
                salesByAsset[asset._id] = {
                    title: asset.title,
                    count: 0,
                    revenue: 0
                };
            }
            salesByAsset[asset._id].count++;
            if (term && term.price) {
                salesByAsset[asset._id].revenue += parseFloat(term.price);
            }
        });

        console.log(`Total Revenue: ${totalRevenue}`);
        console.log("Stats calculation successful.");

        process.exit();
    } catch (err) {
        console.error("CRASHED:", err);
        process.exit(1);
    }
};

connectDB();
