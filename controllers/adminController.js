import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import * as userServices from "../services/userServices.js";
import * as projectServices from "../services/projectservices.js";
import { User } from "../models/user.js";
import { Project } from "../models/project.js";
import { Deadline } from "../models/deadline.js";
import { SupervisorRequest } from "../models/supervisorRequest.js";
import * as notificationService from "../services/notificationServices.js";

import { Notification } from "../models/notification.js";
//
import { sendEmail } from "../services/emailService.js";
import {
  generateWelcomeTemplate,
} from "../utils/emailTamplates.js";
//

// CREATE STUDENT
// Fix: Wrapped in asyncHandler to remove try-catch block
export const createStudent = asyncHandler(async (req, res) => {
  const { name, email, password, department } = req.body;

  const user = await userServices.createUser({
    name,
    email,
    password,
    role: "Student", // Force role to Student
    department,
  });
  try {
    const message = generateWelcomeTemplate(user.name, user.role, password, user.email);
     sendEmail({
      to: user.email,
      subject: "🔐 [Action Required] Your PMS Account Details",
      message,
    });
  } catch (error) {
    console.error("Student welcome email failed to send:", error.message);
  }

  res.status(201).json({
    success: true,
    message: "Student created successfully",
    user: user,
  });
});




// UPDATE STUDENT
export const updateStudent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  // 1. Security: Prevent changing role
  delete updateData.role;

  // 2. Critical: If updating password, we cannot use findByIdAndUpdate
  // because it bypasses bcrypt hashing. We remove password from this general update.
  if (updateData.password) {
    return next(
      new ErrorHandler(
        "Password cannot be updated via this route. Use reset password.",
        400,
      ),
    );
  }

  // 3. Check if user exists and is actually a Student BEFORE updating
  const existingUser = await userServices.getUserById(id);

  if (!existingUser) {
    return next(new ErrorHandler("Student not found", 404));
  }

  // Defensive check: handle both "Student" and "student" gracefully
  if (existingUser.role !== "Student") {
    return next(
      new ErrorHandler("Cannot update a non-student user via this route", 403),
    );
  }

  // ✨ NEW: The Duplicate Email Check!
  // If the admin is changing the email, ensure it's not taken by another user
  if (updateData.email && updateData.email !== existingUser.email) {
    const emailTaken = await User.findOne({ email: updateData.email });
    if (emailTaken) {
      return next(new ErrorHandler("This email is already in use by another account", 400));
    }
  }

  // 4. Perform the update
  const user = await userServices.updateUser(id, updateData);

  res.status(200).json({
    success: true,
    message: "Student updated successfully",
    data: { user },
  });
});

// DELETE STUDENT
export const deleteStudent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await userServices.getUserById(id);

  if (!user) {
    return next(new ErrorHandler("Student not found", 404));
  }

  // Security Check: Ensure we don't delete an Admin or Teacher
  if (user.role?.toLowerCase() !== "student") {
    return next(new ErrorHandler("Cannot delete a non-student user via this route", 400));
  }

  // ✨ The "Clean Sweep" Cascade Delete Logic ✨

  // 🧹 1. Remove student from their Supervisor's roster
  if (user.supervisor) {
    await User.findByIdAndUpdate(user.supervisor, {
      $pull: { assignedStudents: id },
    });
  }

  // 🧹 2. Find their project and delete it + its deadlines
  const project = await Project.findOne({ student: id });
  if (project) {
    await Deadline.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(project._id);
  }

  // 🧹 3. Delete any supervision requests they made
  await SupervisorRequest.deleteMany({ student: id });

  // 🧹 4. Delete their personal notifications (Keep the DB clean!)
  await Notification.deleteMany({ user: id });

  // 🧹 5. Finally, delete the student account using your service!
  await userServices.deleteUser(id);

  res.status(200).json({
    success: true,
    message: "Student and all associated ghost data completely wiped! 👻🔫",
  });
});

//Teacher-routes

//create-teacher
export const createTeacher = asyncHandler(async (req, res, next) => {
  if (!req.body) {
    return next(new ErrorHandler("Request body is missing", 400));
  }

  const { name, email, password, department, maxStudents, expertise } =
    req.body;

  if (
    !name ||
    !email ||
    !password ||
    !department ||
    !maxStudents ||
    !expertise
  ) {
    return next(new ErrorHandler("Please Provide all required fields", 400));
  }
  const user = await userServices.createUser({
    name,
    email,
    password,
    role: "Teacher", // Force role to Teacher
    department,
    maxStudents,
    expertise:
      Array.isArray(expertise) ? expertise
      : typeof expertise === "string" && expertise.trim() !== "" ?
        expertise.split(",").map((expertise) => expertise.trim())
      : [],
  });

  try {
    const message = generateWelcomeTemplate(user.name, user.role, password, user.email);
     sendEmail({
      to: user.email,
      subject: "💼 [Action Required] Your PMS Faculty Account Details",
      message,
    });
  } catch (error) {
    console.error("Teacher welcome email failed to send:", error.message);
  }

  res.status(201).json({
    success: true,
    message: "Teacher created successfully",
    data: { user },
  });
});



// UPDATE TEACHER
export const updateTeacher = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  // 1. Security: Prevent changing role
  delete updateData.role;

  // 2. Critical: If updating password, we cannot use findByIdAndUpdate
  if (updateData.password) {
    return next(
      new ErrorHandler(
        "Password cannot be updated via this route. Use reset password.",
        400,
      ),
    );
  }

  // 3. Check if user exists and is actually a Teacher BEFORE updating
  const existingUser = await userServices.getUserById(id);

  if (!existingUser) {
    return next(new ErrorHandler("Teacher not found", 404));
  }

  // Defensive check: handle both "Teacher" and "teacher" gracefully
  if (existingUser.role?.toLowerCase() !== "teacher") {
    return next(
      new ErrorHandler("Cannot update a non-teacher user via this route", 403),
    );
  }

  // ✨ NEW: The Duplicate Email Check!
  if (updateData.email && updateData.email !== existingUser.email) {
    const emailTaken = await User.findOne({ email: updateData.email });
    if (emailTaken) {
      return next(new ErrorHandler("This email is already in use by another account", 400));
    }
  }

  // ✨ NEW: Safely format expertise if the admin is updating it!
  if (updateData.expertise) {
    updateData.expertise = Array.isArray(updateData.expertise)
      ? updateData.expertise
      : typeof updateData.expertise === "string" && updateData.expertise.trim() !== ""
      ? updateData.expertise.split(",").map((exp) => exp.trim())
      : existingUser.expertise;
  }

  // 4. Perform the update
  const user = await userServices.updateUser(id, updateData);

  res.status(200).json({
    success: true,
    message: "Teacher updated successfully",
    data: { user },
  });
});

// DELETE TEACHER
export const deleteTeacher = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await userServices.getUserById(id);

  if (!user) {
    return next(new ErrorHandler("Teacher not found", 404));
  }

  // Security Check: Ensure we don't delete an Admin or Student
  if (user.role?.toLowerCase() !== "teacher") {
    return next(new ErrorHandler("Cannot delete a non-teacher user via this route", 400));
  }

  // ✨ The "Clean Sweep" Un-Assign Logic ✨

  // 🧹 1. Un-assign this teacher from all their Students
  // We find every student who had this supervisor, and set it to null
  await User.updateMany(
    { supervisor: id },
    { $set: { supervisor: null } }
  );

  // 🧹 2. Un-assign this teacher from all Projects
  // Setting the status back to "pending" is a great UX touch so the admin knows it needs review!
  await Project.updateMany(
    { supervisor: id },
    { $set: { supervisor: null, status: "pending" } }
  );

  // 🧹 3. Delete any pending supervision requests sent to this teacher
  await SupervisorRequest.deleteMany({ supervisor: id });

  // 🧹 4. Delete their personal notifications (Keep the DB clean!)
  await Notification.deleteMany({ user: id });

  // 🧹 5. Finally, delete the teacher account using your service
  await userServices.deleteUser(id);

  res.status(200).json({
    success: true,
    message: "Teacher deleted and successfully un-assigned from all students and projects.",
  });
});

// Get-All-Users
export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await userServices.getAllUsers();

  // 1. ERROR HANDLER: Check if data exists
  if (!users) {
    return next(new ErrorHandler("No users found", 404));
  }

  // Optional: If you want to treat an empty list [] as an error
  // if (users.length === 0) {
  //   return next(new ErrorHandler("No users found in the database", 404));
  // }

  res.status(200).json({
    success: true,
    count: users.length,
    data: { users },
  });
});

// export const assignSupervisor = asyncHandler(async (req, res, next) => {});
export const getAllProjects = asyncHandler(async (req, res, next) => {
  const projects = await projectServices.getAllProjects();
  res.status(200).json({
    success: true,
    message: "Projects fetched successfully",
    data: { projects },
  });
});
export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const [
    totalStudents,
    totalTeachers,
    totalProjects,
    pendingProjects,
    pendingRequests,
    completedProjects,
    allTeachers, // 👈 We fetch the teachers to calculate safely in JS
  ] = await Promise.all([
    User.countDocuments({ role: "Student" }),
    User.countDocuments({ role: "Teacher" }),
    Project.countDocuments(),
    Project.countDocuments({ status: "pending" }),
    SupervisorRequest.countDocuments({ status: "pending" }),
    Project.countDocuments({ status: "completed" }),
    User.find({ role: "Teacher" }), // Fetch all teachers
  ]);

  // Safely calculate available teachers without MongoDB crashing
  let availableTeachers = 0;

  allTeachers.forEach((teacher) => {
    let currentLoad = 0;

    // Safety Check: Is it an array? (Correct schema)
    if (Array.isArray(teacher.assignedStudents)) {
      currentLoad = teacher.assignedStudents.length;
    }
    // Safety Check: Is it a single ObjectId? (Old corrupted test data)
    else if (teacher.assignedStudents) {
      currentLoad = 1;
    }

    const maxLimit = teacher.maxStudents || 5; // Default limit if none is set

    if (currentLoad < maxLimit) {
      availableTeachers++;
    }
  });

  res.status(200).json({
    success: true,
    message: "Dashboard stats fetched successfully",
    data: {
      stats: {
        totalStudents,
        totalTeachers,
        totalProjects,
        pendingProjects,
        pendingRequests,
        completedProjects,
        availableTeachers, // 👈 Safely calculated and sent to frontend
      },
    },
  });
});

export const assignSupervisor = asyncHandler(async (req, res, next) => {
  const { studentId, supervisorId } = req.body;

  if (!studentId || !supervisorId) {
    return next(
      new ErrorHandler("Please provide studentId and supervisorId", 400),
    );
  }

  const project = await Project.findOne({ student: studentId });

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }
  if (project.supervisor) {
    return next(new ErrorHandler("Student already has a supervisor", 400));
  }

  if (project.supervisor !== null) {
    return next(new ErrorHandler("Student already has a supervisor", 400));
  }

  if (project.status !== "approved") {
    return next(new ErrorHandler("Project is not approved yet", 400));
  } else if (project.status === "pending" || project.status === "rejected") {
    return next(
      new ErrorHandler("project is in pending or rejected status", 400),
    );
  }

  const { student, supervisor } = await userServices.assignSupervisorDirectly(
    studentId,
    supervisorId,
  );

  project.supervisor = supervisor;
  await project.save();

  await notificationService.notifyUser(
    studentId,
    `You have been assigned a supervisor ${supervisor.name}.`,
    "approval",
    "/student/dashboard",
    "high",
  );

  await notificationService.notifyUser(
    supervisorId,
    `The student ${student.name} has been officially assigned to you for project supervision`,
    "general",
    "/teacher/dashboard",
    "low",
  );

  res.status(200).json({
    success: true,
    message: "Supervisor assigned successfully",
    data: { student, supervisor },
  });
});

export const getProject = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const user = req.user;
  const project = await projectServices.getProjectById(projectId);
  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }
  const userRole = (user.role || "").toLowerCase();
  const userId = user._id?.toString() || user.id;
  const hasAccess =
    userRole === "admin" ||
    project.student._id.toString() === userId ||
    (project.supervisor && project.supervisor._id.toString() === userId);

  if (!hasAccess) {
    return next(
      new asyncHandler("You do not have access to this project", 403),
    );
  }

  res.status(200).json({
    success: true,
    message: "Project fetched successfully",
    data: { project },
  });
});

export const updateProjectStatus = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id;
  const updateData = req.body;
  const user = req.user;
  const project = await projectServices.getProjectById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

   const userRole = (user.role || "").toLowerCase();
  const userId = user._id?.toString() || user.id;
  const hasAccess =
    userRole === "admin" ||
    project.student._id.toString() === userId ||
    (project.supervisor && project.supervisor._id.toString() === userId);

  if (!hasAccess) {
    return next(
      new ErrorHandler("Not authorized to update this project status", 403),
    );
  }

  const updatedProject = await projectServices.updateProject(projectId, updateData);

  res.status(200).json({
    success: true,
    message: "Project status updated successfully",
    data: { project: updatedProject },
  });
});