const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  complaint: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", default: null },
  type: { type: String, enum: ["complaint_created", "assigned", "status_changed", "comment", "resolved", "reopened", "system"], default: "system" },
  message: { type: String, required: true, trim: true },
  isRead: { type: Boolean, default: false, index: true },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
