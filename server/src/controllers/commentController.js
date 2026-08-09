const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Complaint = require("../models/Complaint");
const createNotification = require("../utils/createNotification");

async function canAccessComplaint(user, complaint) {
  if (user.role === "admin") return true;
  if (user.role === "citizen") return complaint.citizen.toString() === user._id.toString();
  return complaint.assignedOfficer?.toString() === user._id.toString();
}

async function listComments(request, response) {
  if (!mongoose.Types.ObjectId.isValid(request.params.id)) return response.status(400).json({ success: false, message: "Invalid complaint ID" });
  const complaint = await Complaint.findById(request.params.id);
  if (!complaint || !(await canAccessComplaint(request.user, complaint))) return response.status(404).json({ success: false, message: "Complaint not found" });
  const comments = await Comment.find({ complaint: complaint._id }).sort({ createdAt: 1 }).populate("author", "name role");
  return response.json({ success: true, comments });
}

async function addComment(request, response) {
  const message = request.body.message?.trim();
  if (!message) return response.status(400).json({ success: false, message: "Comment message is required" });
  const complaint = await Complaint.findById(request.params.id);
  if (!complaint || !(await canAccessComplaint(request.user, complaint))) return response.status(404).json({ success: false, message: "Complaint not found" });
  const comment = await Comment.create({ complaint: complaint._id, author: request.user._id, message });
  await comment.populate("author", "name role");
  const recipients = new Set([complaint.citizen.toString(), complaint.assignedOfficer?.toString()].filter(Boolean));
  recipients.delete(request.user._id.toString());
  await Promise.all([...recipients].map((recipient) => createNotification({ recipient, complaint: complaint._id, type: "comment", message: `${request.user.name} commented on ${complaint.complaintNumber}` })));
  return response.status(201).json({ success: true, message: "Comment added", comment });
}

module.exports = { listComments, addComment };
