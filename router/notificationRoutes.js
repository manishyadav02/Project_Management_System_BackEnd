import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";   


const router = express.Router();

router.get(
  "/",
  isAuthenticated,
  isAuthorized("Admin", "Teacher", "Student"),
  getNotifications,
);

router.put(
"/:id/read",
  isAuthenticated,
  isAuthorized("Admin", "Teacher", "Student"),
  markAsRead,
);

router.put(
  "/read-all",
  isAuthenticated,
  isAuthorized("Admin", "Teacher", "Student"),
  markAllAsRead,
);

router.delete(
  "/:id/delete",
  isAuthenticated,
  isAuthorized("Admin", "Teacher", "Student"),
  deleteNotification,
);


export default router;