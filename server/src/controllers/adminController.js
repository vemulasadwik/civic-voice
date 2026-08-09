const mongoose = require("mongoose");
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const createNotification = require("../utils/createNotification");
const { COMPLAINT_PRIORITIES, COMPLAINT_STATUSES } = require("../constants/complaintConstants");

function escapeRegex(value = "") { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

async function listAllComplaints(request, response) {
  const page = Math.max(Number(request.query.page) || 1, 1); const limit = Math.min(Math.max(Number(request.query.limit) || 20, 1), 100);
  const query = {};
  for (const field of ["status", "category", "ward", "priority"]) if (request.query[field]) query[field] = request.query[field];
  if (request.query.officer) query.assignedOfficer = request.query.officer;
  if (request.query.search) { const term = new RegExp(escapeRegex(request.query.search), "i"); query.$or = [{ title: term }, { complaintNumber: term }, { description: term }, { "location.address": term }]; }
  const sortOptions = { newest: "-createdAt", oldest: "createdAt", priority: "-priority", updated: "-updatedAt" };
  const [complaints, total] = await Promise.all([
    Complaint.find(query).populate("citizen", "name email phone").populate("assignedOfficer", "name email ward").sort(sortOptions[request.query.sort] || "-createdAt").skip((page - 1) * limit).limit(limit),
    Complaint.countDocuments(query),
  ]);
  return response.json({ success: true, complaints, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

async function getAdminComplaint(request, response) {
  const complaint = await Complaint.findById(request.params.id).populate("citizen", "name email phone ward").populate("assignedOfficer", "name email phone ward").populate("statusHistory.updatedBy", "name role");
  if (!complaint) return response.status(404).json({ success: false, message: "Complaint not found" });
  return response.json({ success: true, complaint });
}

async function assignComplaint(request, response) {
  const officer = await User.findOne({ _id: request.body.officerId, role: "officer", isActive: true });
  if (!officer) return response.status(400).json({ success: false, message: "Active ward officer not found" });
  const complaint = await Complaint.findById(request.params.id);
  if (!complaint) return response.status(404).json({ success: false, message: "Complaint not found" });
  if (!complaint.images.length) return response.status(400).json({ success: false, message: "A complaint must have at least one evidence photo before it can be assigned" });
  complaint.assignedOfficer = officer._id; complaint.status = "Assigned";
  complaint.statusHistory.push({ status: "Assigned", note: request.body.note?.trim() || `Assigned to ${officer.name}`, updatedBy: request.user._id });
  await complaint.save();
  await Promise.all([
    createNotification({ recipient: complaint.citizen, complaint: complaint._id, type: "assigned", message: `${complaint.complaintNumber} was assigned to ${officer.name}` }),
    createNotification({ recipient: officer._id, complaint: complaint._id, type: "assigned", message: `You were assigned ${complaint.complaintNumber}` }),
  ]);
  return response.json({ success: true, message: "Complaint assigned", complaint });
}

async function setPriority(request, response) {
  if (!COMPLAINT_PRIORITIES.includes(request.body.priority)) return response.status(400).json({ success: false, message: "Invalid priority" });
  const complaint = await Complaint.findByIdAndUpdate(request.params.id, { priority: request.body.priority }, { returnDocument: "after", runValidators: true });
  if (!complaint) return response.status(404).json({ success: false, message: "Complaint not found" });
  return response.json({ success: true, message: "Priority updated", complaint });
}

async function adminChangeStatus(request, response) {
  const { status, note = "" } = request.body;
  if (!COMPLAINT_STATUSES.includes(status)) return response.status(400).json({ success: false, message: "Invalid status" });
  const complaint = await Complaint.findById(request.params.id);
  if (!complaint) return response.status(404).json({ success: false, message: "Complaint not found" });
  complaint.status = status; complaint.statusHistory.push({ status, note: note.trim() || `Status changed by administrator`, updatedBy: request.user._id });
  if (status === "Resolved") complaint.resolvedAt = new Date();
  await complaint.save();
  await createNotification({ recipient: complaint.citizen, complaint: complaint._id, type: status === "Resolved" ? "resolved" : "status_changed", message: `${complaint.complaintNumber} is now ${status}` });
  return response.json({ success: true, message: "Status updated", complaint });
}

async function listUsers(request, response) {
  const query = {}; if (request.query.role) query.role = request.query.role; if (request.query.isActive !== undefined) query.isActive = request.query.isActive === "true";
  if (request.query.search) { const term = new RegExp(escapeRegex(request.query.search), "i"); query.$or = [{ name: term }, { email: term }, { ward: term }]; }
  const users = await User.find(query).sort({ createdAt: -1 }); return response.json({ success: true, users });
}

async function createOfficer(request, response) {
  const { name, email, password, phone = "", ward } = request.body;
  if (!name || !email || !password || !ward) return response.status(400).json({ success: false, message: "Name, email, password and ward are required" });
  if (await User.exists({ email: email.trim().toLowerCase() })) return response.status(409).json({ success: false, message: "Email already exists" });
  const officer = await User.create({ name, email, password, phone, ward, role: "officer" });
  return response.status(201).json({ success: true, message: "Officer created", user: { id: officer._id, name: officer.name, email: officer.email, phone: officer.phone, ward: officer.ward, role: officer.role, isActive: officer.isActive } });
}

async function updateUser(request, response) {
  const allowed = ["name", "phone", "ward", "isActive", "role"]; const updates = {};
  for (const field of allowed) if (request.body[field] !== undefined) updates[field] = request.body[field];
  if (updates.role && !["citizen", "officer", "admin"].includes(updates.role)) return response.status(400).json({ success: false, message: "Invalid role" });
  const user = await User.findByIdAndUpdate(request.params.id, updates, { returnDocument: "after", runValidators: true });
  if (!user) return response.status(404).json({ success: false, message: "User not found" });
  return response.json({ success: true, message: "User updated", user });
}

async function dashboard(request, response) {
  const [statusCounts, categoryCounts, wardCounts, totalUsers, officers] = await Promise.all([
    Complaint.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Complaint.aggregate([{ $group: { _id: "$ward", total: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } } } }, { $sort: { total: -1 } }]),
    User.countDocuments({ role: "citizen" }), User.countDocuments({ role: "officer", isActive: true }),
  ]);
  const totalComplaints = statusCounts.reduce((sum, item) => sum + item.count, 0); const resolved = statusCounts.find((item) => item._id === "Resolved")?.count || 0;
  return response.json({ success: true, statistics: { totalComplaints, resolved, resolutionRate: totalComplaints ? Math.round((resolved / totalComplaints) * 100) : 0, citizens: totalUsers, activeOfficers: officers, byStatus: statusCounts, byCategory: categoryCounts, byWard: wardCounts } });
}

async function csvReport(request, response) {
  const complaints = await Complaint.find({}).populate("citizen", "name email").populate("assignedOfficer", "name").sort({ createdAt: -1 });
  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const rows = [["Complaint Number", "Title", "Category", "Ward", "Status", "Priority", "Citizen", "Officer", "Created", "Resolved"], ...complaints.map((item) => [item.complaintNumber, item.title, item.category, item.ward, item.status, item.priority, item.citizen?.name, item.assignedOfficer?.name, item.createdAt.toISOString(), item.resolvedAt?.toISOString() || ""])];
  response.setHeader("Content-Type", "text/csv"); response.setHeader("Content-Disposition", "attachment; filename=civic-voice-report.csv"); return response.send(rows.map((row) => row.map(escape).join(",")).join("\n"));
}

module.exports = { listAllComplaints, getAdminComplaint, assignComplaint, setPriority, adminChangeStatus, listUsers, createOfficer, updateUser, dashboard, csvReport };
