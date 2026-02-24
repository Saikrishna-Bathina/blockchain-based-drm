const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Asset = require('./src/models/Asset');

// Load env vars
dotenv.config({ path: './.env' });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const assets = await Asset.find({});
        console.log(`Total Assets in DB: ${assets.length}`);

        if (assets.length > 0) {
            console.log('Sample Asset:', JSON.stringify(assets[0], null, 2));
        } else {
            console.log('No assets found in the database.');
        }

        process.exit();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

connectDB();
