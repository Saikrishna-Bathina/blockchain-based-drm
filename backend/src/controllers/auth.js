const User = require('../models/User');
const { ethers } = require('ethers');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;

        // Create user
        const user = await User.create({
            username,
            email,
            password,
            role
        });

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Connect crypto wallet
// @route   PUT /api/v1/auth/connect-wallet
// @access  Private
// @desc    Connect crypto wallet
// @route   PUT /api/v1/auth/connect-wallet
// @access  Private
exports.connectWallet = async (req, res, next) => {
    try {
        const { walletAddress, signature, message } = req.body;

        console.log(`[ConnectWallet] Request:`, { walletAddress, message, signatureLength: signature?.length });

        if (!walletAddress || !signature || !message) {
            console.error('[ConnectWallet] Missing fields');
            return res.status(400).json({ success: false, error: 'Please provide wallet address, signature and message' });
        }

        // Verify signature
        try {
            const recoveredAddress = ethers.verifyMessage(message, signature);
            console.log(`[ConnectWallet] Recovered: ${recoveredAddress}, Expected: ${walletAddress}`);

            if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
                console.error('[ConnectWallet] Signature mismatch');
                return res.status(400).json({ success: false, error: 'Signature validation failed' });
            }
        } catch (error) {
            console.error('[ConnectWallet] Verification Error:', error.message);
            return res.status(400).json({ success: false, error: 'Invalid signature format' });
        }

        // Update user
        const user = await User.findByIdAndUpdate(req.user.id, { walletAddress }, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (err) {
        console.error('[ConnectWallet] Server Error:', err);
        res.status(400).json({ success: false, error: err.message });
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        // .cookie('token', token, options) // Optional: if using cookies
        .json({
            success: true,
            token
        });
};
