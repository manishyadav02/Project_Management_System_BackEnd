import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";

import * as projectServices from "../services/projectservices.js";
import * as userservices from "../services/userServices.js";
import { User } from "../models/user.js";
import * as notificationService from "../services/notificationServices.js";
import * as requestServices from "../services/requestServices.js";

import * as fileServices from "../services/fileServices.js";

import { Project } from "../models/project.js";
import { Notification } from "../models/notification.js";
import { SupervisorRequest } from "../models/supervisorRequest.js";
import { sendEmail } from "../services/emailService.js";
import {
  generateRequestAcceptedTemplate,
  generateRequestRejectedTemplate,
} from "../utils/emailTamplates.js";

export const getTeacherDashboardStats = asyncHandler(async (req, res, next) => {
  const teacherId = req.user._id;

  const teacher = await User.findById(teacherId);
  const assignedStudentsCount =
    Array.isArray(teacher.assignedStudents) ?
      teacher.assignedStudents.length
    : 0;

  const totalPendingRequests = await SupervisorRequest.countDocuments({
    supervisor: teacherId,
    status: "pending",
  });

  const completedProjects = await Project.countDocuments({
    supervisor: teacherId,
    status: "completed",
  });

  const recentNotifications = await Notification.find({
    user: teacherId,
    isRead: false,
  })
    .sort({ createdAt: -1 })
    .limit(5);

  const dashboardStats = {
    assignedStudents: assignedStudentsCount,
    totalPendingRequests,
    completedProjects,
    recentNotifications,
  };

  res.status(200).json({
    success: true,
    message: "Dashboard stats fetched successfully",
    data: { dashboardStats },
  });
});

export const getRequests = asyncHandler(async (req, res, next) => {
  const supervisor = req.user._id;

  const filters = { supervisor }; // Apply it to the filters
  const { requests, total } = await requestServices.getAllRequests(filters);

  const updatedRequests = await Promise.all(
    requests.map(async (reqObj) => {
      const requestObj = reqObj.toObject ? reqObj.toObject() : reqObj;

      if (requestObj?.student?._id) {
        const latestProject = await Project.findOne({
          student: requestObj.student._id,
        })
          .sort({ createdAt: -1 })
          .lean();
        return { ...requestObj, latestProject };
      }
      return requestObj;
    }),
  );

  res.status(200).json({
    success: true,
    message: "Requests fetched successfully",
    data: { requests: updatedRequests, total },
  });
});

export const acceptRequest = asyncHandler(async (req, res, next) => {
  const { requestid } = req.params;
  const teacherId = req.user._id;

  const request = await requestServices.acceptRequest(requestid, teacherId);
  if (!request) {
    return next(new ErrorHandler("Request not found", 404));
  }

  const student = await User.findById(request.student._id);
  const teacher = await User.findById(teacherId);
  const project = await Project.findOne({ student: student._id }).sort({
    createdAt: -1,
  });

  student.supervisor = teacherId;

  if (!teacher.assignedStudents.includes(student._id)) {
    teacher.assignedStudents.push(student._id);
  }

  if (project) {
    project.supervisor = teacherId;
    await project.save();
  }

  await Promise.all([student.save(), teacher.save()]);

  await notificationService.notifyUser(
    request.student._id,
    `Your supervisor request to ${req.user.name} has been accepted.`,
    "approval",
    "/students/status",
    "low",
  );

  await notificationService.notifyUser(
    request.student._id,
    `${student.name}'s project is now officially supervised by ${req.user.name}.`,
    "system",
    "/admin/projects",
    "medium",
  );

  // ✨ Fire-and-Forget Email
  try {
    const message = generateRequestAcceptedTemplate(req.user.name);
    sendEmail({
      to: student.email,
      subject: "[PMS] 🎉 Great news! Your supervisor request was accepted",
      message,
    }).catch((err) => console.error("Email error:", err));
  } catch (error) {
    console.error("Template error:", error);
  }

  res.status(200).json({
    success: true,
    message: "Request accepted successfully",
    data: { request },
  });
});

export const rejectRequest = asyncHandler(async (req, res, next) => {
  const { requestid } = req.params;
  const teacherId = req.user._id;

  const request = await requestServices.rejectRequest(requestid, teacherId);
  if (!request) {
    return next(new ErrorHandler("Request not found", 404));
  }

  const student = await User.findById(request.student._id);

  await notificationService.notifyUser(
    request.student._id,
    `Your supervisor request to ${req.user.name} has been rejected.`,
    "rejection",
    "/students/status",
    "high",
  );

  await notificationService.notifyUser(
    request.student._id,
    `${req.user.name} has declined the supervision request from ${student.name}.`,
    "system",
    "/admin/requests",
    "medium",
  );

  try {
    const message = generateRequestRejectedTemplate(req.user.name);
    sendEmail({
      to: student.email,
      subject: "[PMS] Update regarding your supervisor request",
      message,
    }).catch((err) => console.error("Email error:", err));
  } catch (error) {
    console.error("Template error:", error);
  }

  res.status(200).json({
    success: true,
    message: "Request rejected successfully",
    data: { request },
  });
});

export const getAssignedStudents = asyncHandler(async (req, res, next) => {
  const teacherId = req.user._id;

  const supervisedProjects = await Project.find({ supervisor: teacherId })
    .populate("student", "name email ")
    .sort({ updatedAt: -1 });

  const formattedStudents = supervisedProjects.map((projectDoc) => {
    const project = projectDoc.toObject();

    // Extract the populated student info
    const studentInfo = project.student;

    delete project.student;

    return {
      ...studentInfo,
      project: project,
    };
  });

  res.status(200).json({
    success: true,
    message: "Assigned students fetched successfully",
    data: {
      students: formattedStudents,
      total: formattedStudents.length,
    },
  });
});

export const markProjectAsComplete = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const teacherId = req.user._id;

  const project = await projectServices.getProjectById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  if (
    !project.supervisor ||
    project.supervisor._id.toString() !== teacherId.toString()
  ) {
    return next(
      new ErrorHandler(
        "You are not authorized to mark this project as complete",
        403,
      ),
    );
  }

  if (project.status !== "approved") {
    return next(
      new ErrorHandler(
        "Project must be approved before it can be marked complete",
        400,
      ),
    );
  }

  const updatedProject = await projectServices.markComplete(projectId);

  // Safely extract student ID whether it was populated or not
  const studentId = project.student._id || project.student;

  await notificationService.notifyUser(
    studentId,
    `Your project "${project.title}" has been marked as complete by your supervisor, ${req.user.name}.`,
    "approval",
    "/students/status",
    "low",
  );
  await notificationService.notifyUser(
    studentId,
    `Project Completed: ${req.user.name} has marked ${project.student.name}'s project as 100% complete!`,
    "system",
    "/admin/projects",
    "high", // High priority because this is a major milestone!
  );

  res.status(200).json({
    success: true,
    message: "Project marked as complete successfully",
    // 🚨 FIX: Send the fresh data back to the frontend
    data: { project: updatedProject },
  });
});

export const addFeedback = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const teacherId = req.user._id;
  const { title, message, type } = req.body;

  const project = await projectServices.getProjectById(projectId);

  if (!project) return next(new ErrorHandler("Project not found", 404));

  if (project.supervisor._id.toString() !== teacherId.toString()) {
    return next(
      new ErrorHandler(
        "You are not authorized to add feedback for this project",
        403,
      ),
    );
  }
  if (!message || !title) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  const { project: updatedProject, latestFeedback } =
    await projectServices.addFeedback(
      projectId,
      title,
      message,
      type,
      teacherId,
    );

  // Notify the student about the new feedback
  await notificationService.notifyUser(
    project.student._id,
    `Your supervisor, ${req.user.name}, has added new feedback to your project: "${title}".`,
    "feedback",
    `/students/feedback`,
    type === "positive" ? "low"
    : type === "negative" ? "high"
    : "medium",
  );

  res.status(200).json({
    success: true,
    message: "Feedback added successfully",
    data: { project: updatedProject, feedback: latestFeedback },
  });
});

export const getFiles = asyncHandler(async (req, res, next) => {
  const teacherId = req.user._id;
  const projects = await projectServices.getProjectBySupervisor(teacherId);

  const allFiles = projects.flatMap((project) =>
    project.files.map((file) => ({
      ...file.toObject(),
      projectId: project._id,
      projectTitle: project.title,
      studentName: project.student.name,
      studentEmail: project.student.email,
    })),
  );
  res.status(200).json({
    success: true,
    message: "Files fetched successfully",
    data: { files: allFiles },
  });
});

export const downloadFile = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const supervisorId = req.user._id;

  const project = await projectServices.getProjectById(projectId);
  if (!project) return next(new ErrorHandler("Project not found", 404));

  const dbSupervisorId =
    project.supervisor._id ?
      project.supervisor._id.toString()
    : project.supervisor.toString();

  if (dbSupervisorId !== supervisorId.toString()) {
    return next(
      new ErrorHandler(
        "Not authorized to download files for this project",
        401,
      ),
    );
  }

  const file = project.files.find(
    (f) => f._id.toString() === fileId.toString(),
  );

  if (!file)
    return next(new ErrorHandler("File not found in this project", 404));

  const directDownloadUrl = file.fileUrl.replace("/upload/", "/upload/fl_attachment/");
  return res.status(200).json({
    success:true,
   fileUrl: directDownloadUrl,
    fileName:file.fileName,
  })
});
