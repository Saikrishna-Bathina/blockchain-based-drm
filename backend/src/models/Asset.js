const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title can not be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description can not be more than 500 characters']
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    contentType: {
        type: String,
        enum: ['video', 'audio', 'image', 'text'],
        required: true
    },
    originalFileName: {
        type: String,
        required: true
    },
    storagePath: { // Storing local multer filename/path
        type: String
    },
    cid: {
        type: String,
    },
    encryptionKey: {
        type: String, // Encrypted key or reference to key
        select: false // Do not return by default
    },
    iv: {
        type: String,
        select: false
    },
    originalityVerified: {
        type: Boolean,
        default: false
    },
    originalityScore: {
        type: Number,
        min: 0,
        max: 100
    },
    originalityReport: {
        type: Object, // Store detailed report from python engine
        select: false
    },
    licenseTerms: {
        license1: { price: { type: Number, default: 0 }, enabled: { type: Boolean, default: false } }, // One-Time / View-Only etc
        license2: { price: { type: Number, default: 0 }, enabled: { type: Boolean, default: false } }, // Limited / Quotation etc
        license3: { price: { type: Number, default: 0 }, enabled: { type: Boolean, default: false } }, // Commercial / Clip etc
        license4: { price: { type: Number, default: 0 }, enabled: { type: Boolean, default: false } }, // Derivative / Exclusive etc
        royaltySplits: [{
            recipient: String, // Wallet address
            percentage: Number
        }]
    },
    blockchainId: {
        type: String // To store on-chain ID after minting
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Asset', AssetSchema);
