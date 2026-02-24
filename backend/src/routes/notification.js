const express = require('express');
const { getMyNotifications } = require('../controllers/notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getMyNotifications);

module.exports = router;
