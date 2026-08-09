const Complaint = require("../models/Complaint");
const createNotification = require("../utils/createNotification");

async function listAssignedComplaints(request, response) {
  const query = { assignedOfficer: request.user._id }; if (request.query.status) query.status = request.query.status;
  const complaints = await Complaint.find(query).populate("citizen", "name email phone").sort({ updatedAt: -1 });
  return response.json({ success: true, complaints });
}

async function getAssignedComplaint(request, response) {
  const complaint = await Complaint.findOne({ _id: request.params.id, assignedOfficer: request.user._id }).populate("citizen", "name email phone ward").populate("statusHistory.updatedBy", "name role");
  if (!complaint) return response.status(404).json({ success: false, message: "Assigned complaint not found" });
  return response.json({ success: true, complaint });
}

async function updateOfficerStatus(request, response) {
  const complaint = await Complaint.findOne({ _id: request.params.id, assignedOfficer: request.user._id });
  if (!complaint) return response.status(404).json({ success: false, message: "Assigned complaint not found" });
  const allowed = { Assigned: ["In Progress"], Reopened: ["In Progress"], "In Progress": ["Resolved"] };
  const nextStatus = request.body.status;
  if (!allowed[complaint.status]?.includes(nextStatus)) return response.status(400).json({ success: false, message: `Cannot change ${complaint.status} to ${nextStatus}` });
  if (nextStatus === "Resolved" && complaint.completionImages.length === 0) return response.status(400).json({ success: false, message: "Upload at least one completion image before resolving the complaint" });
  complaint.status = nextStatus;
  if (nextStatus === "In Progress" && !complaint.acceptedAt) complaint.acceptedAt = new Date();
  if (nextStatus === "Resolved") complaint.resolvedAt = new Date();
  complaint.statusHistory.push({ status: nextStatus, note: request.body.note?.trim() || (nextStatus === "In Progress" ? "Officer started working on the complaint" : "Work completed by ward officer"), updatedBy: request.user._id });
  await complaint.save();
  await createNotification({ recipient: complaint.citizen, complaint: complaint._id, type: nextStatus === "Resolved" ? "resolved" : "status_changed", message: `${complaint.complaintNumber} is now ${nextStatus}` });
  return response.json({ success: true, message: "Complaint status updated", complaint });
}

async function addProgressNote(request, response) {
  const note = request.body.note?.trim(); if (!note) return response.status(400).json({ success: false, message: "Progress note is required" });
  const complaint = await Complaint.findOne({ _id: request.params.id, assignedOfficer: request.user._id });
  if (!complaint) return response.status(404).json({ success: false, message: "Assigned complaint not found" });
  complaint.statusHistory.push({ status: complaint.status, note, updatedBy: request.user._id }); await complaint.save();
  await createNotification({ recipient: complaint.citizen, complaint: complaint._id, type: "status_changed", message: `New progress update for ${complaint.complaintNumber}` });
  return response.status(201).json({ success: true, message: "Progress note added", complaint });
}

module.exports = { listAssignedComplaints, getAssignedComplaint, updateOfficerStatus, addProgressNote };
