const dns = require("node:dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDatabase = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const complaintRoutes = require(
  "./src/routes/complaintRoutes"
);

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes); 
app.use("/api/complaints", complaintRoutes);  

app.get("/api/health", (request, response) => {
  response.status(200).json({
    success: true,
    message: "Civic Voice backend is working",
    database:
      require("mongoose").connection.readyState === 1
        ? "Connected"
        : "Disconnected",
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();