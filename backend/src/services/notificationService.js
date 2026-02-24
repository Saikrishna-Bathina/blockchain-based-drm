const Notification = require('../models/Notification');

exports.createNotification = async (userId, type, title, message, metadata = {}) => {
    try {
        await Notification.create({
            user: userId,
            type,
            title,
            message,
            metadata
        });
        console.log(`[NotificationService] Activity logged: ${type} for user ${userId}`);
    } catch (err) {
        console.error('[NotificationService] Failed to log activity:', err.message);
    }
};

exports.getNotifications = async (userId, limit = 10) => {
    return await Notification.find({ user: userId })
        .sort('-createdAt')
        .limit(limit);
};
