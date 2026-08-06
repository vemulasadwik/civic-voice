const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require(
  "../middleware/roleMiddleware"
);
const {
  createComplaint,
  getMyComplaints,
  getMyComplaintById,
} = require("../controllers/complaintController");

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("citizen"));

router.post("/", createComplaint);
router.get("/mine", getMyComplaints);
router.get("/mine/:id", getMyComplaintById);

module.exports = router;