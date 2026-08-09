const Notification = require("../models/Notification");

async function createNotification({ recipient, complaint = null, type = "system", message }) {
  if (!recipient) return null;
  return Notification.create({ recipient, complaint, type, message });
}

module.exports = createNotification;
