const router = require("express").Router();
const authenticate = require("../middleware/authMiddleware");
const { listNotifications, markNotificationRead, markAllNotificationsRead, deleteAllNotifications } = require("../controllers/notificationController");
router.use(authenticate);
router.get("/", listNotifications);
router.patch("/read-all", markAllNotificationsRead);
router.delete("/", deleteAllNotifications);
router.patch("/:id/read", markNotificationRead);
module.exports = router;
