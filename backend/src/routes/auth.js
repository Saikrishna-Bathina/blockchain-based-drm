const express = require('express');
const { register, login, getMe, connectWallet } = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/connect-wallet', protect, connectWallet);

module.exports = router;
