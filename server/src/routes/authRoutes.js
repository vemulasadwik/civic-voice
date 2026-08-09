const express = require("express");
const { register, login, getCurrentUser, updateProfile, changePassword } = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getCurrentUser);
router.patch("/me", authenticate, updateProfile);
router.patch("/change-password", authenticate, changePassword);


module.exports = router;
