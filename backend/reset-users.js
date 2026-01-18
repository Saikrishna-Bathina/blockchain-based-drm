const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const clearUsers = async () => {
    await connectDB();
    try {
        await mongoose.connection.collection('users').deleteMany({});
        console.log('All users cleared.');
        process.exit();
    } catch (error) {
        console.error('Error clearing users:', error);
        process.exit(1);
    }
};

clearUsers();
