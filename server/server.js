const dns = require("node:dns");
const dotenv = require("dotenv");

dotenv.config();
if (process.env.NODE_ENV !== "production") dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const mongoose = require("mongoose");
const path = require("node:path");
const connectDatabase = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const complaintRoutes = require("./src/routes/complaintRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const officerRoutes = require("./src/routes/officerRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173").split(",").map((item) => item.trim());

app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin(origin, callback) { if (!origin || allowedOrigins.includes(origin)) return callback(null, true); callback(new Error("Origin is not allowed by CORS")); }, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
if (process.env.NODE_ENV !== "test") app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads"), { maxAge: "7d" }));

app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true, legacyHeaders: false }), authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/officer", officerRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/health", (request, response) => response.json({ success: true, message: "Civic Voice API is running", database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" }));
app.use((request, response) => response.status(404).json({ success: false, message: "API route not found" }));
app.use((error, request, response, next) => {
  console.error(error);
  if (error.name === "MulterError") return response.status(400).json({ success: false, message: error.code === "LIMIT_FILE_SIZE" ? "Each image must be 5 MB or smaller" : error.message });
  return response.status(error.status || 500).json({ success: false, message: process.env.NODE_ENV === "production" ? "Something went wrong" : error.message });
});

const PORT = process.env.PORT || 5000;
async function startServer() { await connectDatabase(); app.listen(PORT, "0.0.0.0", () => console.log(`Server running at http://localhost:${PORT}`)); }
if (require.main === module) startServer();

module.exports = app;
