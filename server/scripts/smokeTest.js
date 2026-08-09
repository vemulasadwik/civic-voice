const dns = require("node:dns");
const dotenv = require("dotenv");
dotenv.config();
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const app = require("../server");
const connectDatabase = require("../src/config/db");
const User = require("../src/models/User");
const Complaint = require("../src/models/Complaint");
const Comment = require("../src/models/Comment");
const Notification = require("../src/models/Notification");

const runId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const ids = { users: [], complaints: [] };
let server;

async function request(base, path, { method = "GET", token, body, formData } = {}) {
  const response = await fetch(`${base}${path}`, { method, headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: formData || (body ? JSON.stringify(body) : undefined) });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) throw new Error(`${method} ${path} failed (${response.status}): ${typeof data === "string" ? data : data.message}`);
  return data;
}

async function run() {
  await connectDatabase();
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;

  const citizenEmail = `citizen-${runId}@test.civicvoice.local`;
  const adminEmail = `admin-${runId}@test.civicvoice.local`;
  const officerEmail = `officer-${runId}@test.civicvoice.local`;
  const password = "SmokeTest_12345";

  const registration = await request(base, "/auth/register", { method: "POST", body: { name: "Smoke Citizen", email: citizenEmail, password, phone: "9999999999", ward: "Ward Test" } });
  ids.users.push(registration.user.id); const citizenToken = registration.token;
  const admin = await User.create({ name: "Smoke Admin", email: adminEmail, password, role: "admin" }); ids.users.push(admin._id);
  const adminLogin = await request(base, "/auth/login", { method: "POST", body: { email: adminEmail, password } });
  const officerResponse = await request(base, "/admin/officers", { method: "POST", token: adminLogin.token, body: { name: "Smoke Officer", email: officerEmail, password, phone: "8888888888", ward: "Ward Test" } }); ids.users.push(officerResponse.user.id);
  const officerLogin = await request(base, "/auth/login", { method: "POST", body: { email: officerEmail, password } });

  const created = await request(base, "/complaints", { method: "POST", token: citizenToken, body: { title: "Smoke test road damage", description: "Automated lifecycle verification complaint.", category: "Road Damage", ward: "Ward Test", location: { address: "Test Road, Test Ward" } } });
  const complaintId = created.complaint._id; ids.complaints.push(complaintId);
  await request(base, `/admin/complaints/${complaintId}/priority`, { method: "PATCH", token: adminLogin.token, body: { priority: "High" } });
  await request(base, `/admin/complaints/${complaintId}/assign`, { method: "PATCH", token: adminLogin.token, body: { officerId: officerResponse.user.id } });
  await request(base, `/officer/complaints/${complaintId}/status`, { method: "PATCH", token: officerLogin.token, body: { status: "In Progress", note: "Smoke test work started" } });
  await request(base, `/officer/complaints/${complaintId}/progress`, { method: "POST", token: officerLogin.token, body: { note: "Smoke test progress note" } });
  const completionForm = new FormData();
  const onePixelPng = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");
  completionForm.append("images", new Blob([onePixelPng], { type: "image/png" }), "completed-work.png");
  await request(base, `/officer/complaints/${complaintId}/images`, { method: "POST", token: officerLogin.token, formData: completionForm });
  await request(base, `/officer/complaints/${complaintId}/status`, { method: "PATCH", token: officerLogin.token, body: { status: "Resolved", note: "Smoke test work completed" } });
  await request(base, `/complaints/${complaintId}/reopen`, { method: "PATCH", token: citizenToken, body: { note: "Smoke test reopening verification" } });
  await request(base, `/complaints/${complaintId}/comments`, { method: "POST", token: citizenToken, body: { message: "Smoke test citizen comment" } });
  await request(base, "/notifications", { token: citizenToken });
  await request(base, "/admin/dashboard", { token: adminLogin.token });
  await request(base, "/admin/reports.csv", { token: adminLogin.token });
  console.log("PASS: complete Civic Voice API lifecycle");
}

run().catch((error) => { console.error(`FAIL: ${error.message}`); process.exitCode = 1; }).finally(async () => {
  try {
    await Comment.deleteMany({ complaint: { $in: ids.complaints } });
    await Notification.deleteMany({ $or: [{ complaint: { $in: ids.complaints } }, { recipient: { $in: ids.users } }] });
    await Complaint.deleteMany({ _id: { $in: ids.complaints } });
    await User.deleteMany({ _id: { $in: ids.users } });
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
  }
});
