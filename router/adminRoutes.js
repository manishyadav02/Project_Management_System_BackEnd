import express from "express";
import {
  createStudent,
  updateStudent,
  deleteStudent,
  getAllUsers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getDashboardStats,  
  assignSupervisor,
  getAllProjects,
  updateProjectStatus,
  getProject,} from "../controllers/adminController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin Routes for student management
router.get(
  "/users",
  isAuthenticated,
  isAuthorized("Admin"),
  getAllUsers,
);

router.post(
  "/create-student",
  isAuthenticated,
  isAuthorized("Admin"),
  createStudent,
);

router.put(
  "/update-student/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  updateStudent,
);
router.delete(
    "/delete-student/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  deleteStudent,
);

//Teacher-Routes


router.post(
  "/create-teacher",
  isAuthenticated,
  isAuthorized("Admin"),
  createTeacher,
);

router.put(
  "/update-teacher/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  updateTeacher,
);
router.delete(
    "/delete-teacher/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  deleteTeacher,
);

router.get(
  "/dashboard-stats",
  isAuthenticated,
  isAuthorized("Admin"),
  getDashboardStats,
);


//projects
router.get(
    "/projects",
  isAuthenticated,
  isAuthorized("Admin"),
  getAllProjects,
);

router.post(
  "/assign-supervisor",
  isAuthenticated,
  isAuthorized("Admin"),
  assignSupervisor,
);
router.get(
  "/project/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  getProject,
);
router.put(
  "/project/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  updateProjectStatus,
);



export default router;
