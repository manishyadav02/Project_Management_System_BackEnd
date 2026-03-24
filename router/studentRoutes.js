import express from "express";
import {
    getAvailableSupervisors,
    getStudentProject,
    submitProposal,
    getSupervisor,
    uploadFiles,
    requestSupervisor,
    getDeshboardStats,
    getFeedback,
    downloadFile,
  } from "../controllers/studentController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import upload, { handleUploadError } from "../middlewares/upload.js";


const router = express.Router();

// 


router.get(
  "/project",
  isAuthenticated,
  isAuthorized("Student"),
  getStudentProject,
);

router.post(
  "/project-proposal",
  isAuthenticated,
  isAuthorized("Student"),
  submitProposal,
);

router.post(
  "/upload/:projectId",
  isAuthenticated,
  isAuthorized("Student"),
  upload.array("files", 10),
  handleUploadError,
  uploadFiles,
);

router.get(
  "/fetch-supervisors",
  isAuthenticated,
  isAuthorized("Student"),
  getAvailableSupervisors,
  
)
router.get(
  "/supervisor",
  isAuthenticated,
  isAuthorized("Student"),
  getSupervisor,
  
)
router.post(
  "/request-supervisor",
  isAuthenticated,
  isAuthorized("Student"),
  requestSupervisor,
  
)
router.get(
  "/feedback/:projectId",
  isAuthenticated,
  isAuthorized("Student"),
  getFeedback,
  
)
router.get(
  "/fetch-dashboard-stats",
  isAuthenticated,
  isAuthorized("Student"),
  getDeshboardStats,
  
)
router.get(
  "/download/:projectId/:fileId",
  isAuthenticated,
  isAuthorized("Student"),
  downloadFile,
  
)
 


export default router;
