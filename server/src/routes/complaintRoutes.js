const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require(
  "../middleware/roleMiddleware"
);
const {
  createComplaint,
  getMyComplaints,
  getMyComplaintById,
  reopenComplaint,
  deleteComplaint,
} = require("../controllers/complaintController");
const { listComments, addComment } = require("../controllers/commentController");
const upload = require("../middleware/uploadMiddleware");
const { uploadComplaintImages, deleteComplaintImage } = require("../controllers/uploadController");

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("citizen"));

router.post("/", createComplaint);
router.get("/mine", getMyComplaints);
router.get("/mine/:id", getMyComplaintById);
router.patch("/:id/reopen", reopenComplaint);
router.delete("/:id", deleteComplaint);
router.get("/:id/comments", listComments);
router.post("/:id/comments", addComment);
router.post("/:id/images", upload.array("images", 5), uploadComplaintImages);
router.delete("/:id/images", deleteComplaintImage);

module.exports = router;
