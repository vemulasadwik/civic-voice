const dns = require("node:dns");
const dotenv = require("dotenv");
dotenv.config();
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");
const connectDatabase = require("../src/config/db");
const User = require("../src/models/User");

async function run() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error("Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env first");
  if (ADMIN_PASSWORD.length < 8) throw new Error("ADMIN_PASSWORD must contain at least 8 characters");
  await connectDatabase();
  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) { existing.role = "admin"; existing.isActive = true; await existing.save(); console.log(`Updated ${existing.email} as administrator`); }
  else { const admin = await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: "admin" }); console.log(`Created administrator ${admin.email}`); }
}

run().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
