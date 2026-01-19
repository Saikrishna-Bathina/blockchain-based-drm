const mongoose = require('mongoose');

const LicenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    asset: {
        type: mongoose.Schema.ObjectId,
        ref: 'Asset',
        required: true
    },
    transactionHash: {
        type: String,
        required: true,
        unique: true
    },
    licenseType: {
        type: String, // e.g., "license2"
        required: true
    },
    purchaseTime: {
        type: Date,
        default: Date.now
    },
    expiryTime: {
        type: Date,
        // If null, it means Lifetime access
    },
    active: {
        type: Boolean,
        default: true
    }
});

// Compound index to quickly find if a user has a license for an asset
LicenseSchema.index({ user: 1, asset: 1 });

module.exports = mongoose.model('License', LicenseSchema);
