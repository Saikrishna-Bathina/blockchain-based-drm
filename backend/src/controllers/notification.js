const { getNotifications } = require('../services/notificationService');

// @desc    Get user notifications/activities
// @route   GET /api/v1/notifications
// @access  Private
exports.getMyNotifications = async (req, res, next) => {
    try {
        const notifications = await getNotifications(req.user.id);

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (err) {
        console.error("Get Notifications Error:", err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
