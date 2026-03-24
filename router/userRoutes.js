import express from "express";
import {
  registerUser,
  login,
  logout,
  getUser,
  forgotPassword,
  resetPassword,
  
} from "../controllers/authController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User registration route
router.post("/register", registerUser);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUser);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);

export default router;
