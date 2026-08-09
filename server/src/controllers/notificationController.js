const Notification = require("../models/Notification");

async function listNotifications(request, response) {
  const notifications = await Notification.find({ recipient: request.user._id })
    .sort({ createdAt: -1 }).limit(100).populate("complaint", "complaintNumber title status");
  return response.json({ success: true, unreadCount: notifications.filter((item) => !item.isRead).length, notifications });
}

async function markNotificationRead(request, response) {
  const notification = await Notification.findOneAndUpdate(
    { _id: request.params.id, recipient: request.user._id }, { isRead: true }, { returnDocument: "after" }
  );
  if (!notification) return response.status(404).json({ success: false, message: "Notification not found" });
  return response.json({ success: true, notification });
}

async function markAllNotificationsRead(request, response) {
  await Notification.updateMany({ recipient: request.user._id, isRead: false }, { isRead: true });
  return response.json({ success: true, message: "All notifications marked as read" });
}

async function deleteAllNotifications(request, response) {
  const result = await Notification.deleteMany({ recipient: request.user._id });
  return response.json({ success: true, message: "All notifications removed", deletedCount: result.deletedCount });
}

module.exports = { listNotifications, markNotificationRead, markAllNotificationsRead, deleteAllNotifications };
