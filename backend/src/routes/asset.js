const express = require('express');
const { uploadAsset, getAssets, getAsset, updateBlockchainId, verifyOriginality, secureAsset } = require('../controllers/asset');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
const { streamAsset } = require('../controllers/stream');

router.route('/')
    .get(getAssets);

router.route('/upload')
    .post(protect, upload.single('file'), uploadAsset); // 'file' is the field name

router.route('/:id')
    .get(getAsset);

router.route('/:id/mint')
    .put(protect, updateBlockchainId);

router.route('/:id/verify')
    .put(protect, verifyOriginality);

router.route('/:id/secure')
    .put(protect, secureAsset);

router.route('/:id/stream')
    .get(protect, streamAsset);

module.exports = router;
