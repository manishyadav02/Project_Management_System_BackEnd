import express from "express";
import { downloadProjectFiles } from "../controllers/projectController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
  "/:projectId/files/:fileId/download",
  isAuthenticated,
  downloadProjectFiles,
);

export default router;
