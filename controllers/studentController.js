import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";

import * as projectServices from "../services/projectservices.js";
import { User } from "../models/user.js";
import * as notificationService from "../services/notificationServices.js";
// import { SupervisorRequest } from "../models/supervisorRequest.js";
import * as requestServices from "../services/requestServices.js";
import * as fileServices from "../services/fileServices.js";
import { Project } from "../models/project.js";
import { Notification } from "../models/notification.js";
import cloudinary from "../config/cloudinary.js";


export const getStudentProject = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  const Project = await projectServices.getProjectByStudent(studentId);

  if (!Project) {
    return res.status(404).json({
      success: false,
      data: { Project: null },
      message: "No Project found for this student",
    });
  }
  res.status(200).json({
    success: true,
    data: { Project },
  });
});

export const submitProposal = asyncHandler(async (req, res, next) => {
  const { title, description } = req.body;
  const studentId = req.user._id;

  const existingProject = await projectServices.getProjectByStudent(studentId);

  // 🛑 THE FIX: Block if it exists and the status is NOT rejected
  if (existingProject && existingProject.status !== "rejected") {
    return next(
      new ErrorHandler(
        `You already have a project in '${existingProject.status}' status. You can only submit a new proposal if your previous one was rejected.`,
        400,
      ),
    );
  }
  if (existingProject && existingProject.status === "rejected") {
    await Project.findByIdAndDelete(existingProject._id);
  }

  const projectData = {
    student: studentId,
    title,
    description,
    // deadline: new Date(deadline),
  };

  const project = await projectServices.createProject(projectData);

  await User.findByIdAndUpdate(studentId, {
    $push: { projects: project._id },
  });

  res.status(201).json({
    success: true,
    message: "Project proposal submitted successfully",
    data: { project },
  });
});

// file uploads

export const uploadFiles = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  const { projectId } = req.params;
  const project = await projectServices.getProjectById(projectId);

  if (!project || project.student._id.toString() !== studentId.toString()|| project.status === "rejected") {
    return next(
      new ErrorHandler("Not authorized to upload files. Make sure you have submitted a project proposal first.", 401),
    );
  }

  if (!req.files || req.files.length === 0) {
    return next(new ErrorHandler("No files were uploaded.", 400));
  }

  const uploadedFiles = [];

  // ✨ THE FIX: We don't upload again! We just read what CloudinaryStorage already did.
  for(let file of req.files){
    uploadedFiles.push({
      fileType: file.mimetype,
      // CloudinaryStorage automatically puts the live URL inside 'file.path'
      fileUrl: file.path, 
      // Multer stores the actual name in 'originalname', not 'fileName'
      fileName: file.originalname 
    });
  }

  // Process uploaded files here
  const updatedProject = await projectServices.addFilesToProject(
    projectId,
    uploadedFiles, // Pass the formatted array
  );

  res.status(200).json({
    success: true,
    message: "Files uploaded successfully",
    data: { project: updatedProject },
  });
});

export const getAvailableSupervisors = asyncHandler(async (req, res, next) => {
  const supervisors = await User.find({ role: "Teacher" })
    .select("name email department expertise")
    .lean();

  res.status(200).json({
    success: true,
    data: { supervisors },
    message: "Supervisors fetched successfully",
  });
});

export const getSupervisor = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  const student = await User.findById(studentId).populate(
    "supervisor",
    "name email department expertise",
  );

  if (!student.supervisor) {
    return res.status(404).json({
      success: false,
      message: "No supervisor found for this student",
    });
  }
  res.status(200).json({
    success: true,
    data: { supervisor: student.supervisor },
  });
});

export const requestSupervisor = asyncHandler(async (req, res, next) => {
  const { teacherId, message } = req.body;
  const studentId = req.user._id;
  const student = await User.findById(studentId);

  if (student.supervisor) {
    return next(new ErrorHandler("You already have a supervisor", 400));
  }
  const supervisor = await User.findById(teacherId);

  if (!supervisor || supervisor.role !== "Teacher") {
    return next(new ErrorHandler("Invalid supervisor", 400));
  }
  if (supervisor.maxStudents === supervisor.assignedStudents.length) {
    return next(
      new ErrorHandler(
        " Selected supervisor has reached their maximum students",
        400,
      ),
    );
  }

  const requestData = {
    student: studentId,
    supervisor: teacherId,
    message,
  };

  const request = await requestServices.createRequest(requestData);

  await notificationService.notifyUser(
    teacherId,
    `${student.name} has requested ${supervisor.name} as a supervisor.`,
    "request",
    "/teacher/requests",
    "low",
  );

  // await User.findByIdAndUpdate(studentId, {
  //   $push: { requests: request._id },
  // });

  res.status(201).json({
    success: true,
    message: "Supervisor request sent successfully",
    data: { request },
  });
});

export const getDeshboardStats = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;

  const project = await Project.findOne({ student: studentId })
    .sort({ createdAt: -1 })
    .populate("supervisor", "name")
    .lean();
  const now = new Date();
  const upcomingDeadlines = await Project.find({
    student: studentId,
    deadline: { $gte: now },
  })
    .select("title description deadline status")
    .sort({ deadline: 1 })
    .limit(3)
    .lean();

  const totalProjects = await Project.countDocuments({ student: studentId });

  const pendingProjects = await Project.countDocuments({
    student: studentId,
    status: "pending",
  });
  const topNotifications = await Notification.find({ user: studentId })
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  const feedbackNotification =
    project?.feedback && project?.feedback.length > 0 ?
      project.feedback
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 2)
    : [];

  const supervisorName = project?.supervisor?.name || "No supervisor assigned";

  res.status(200).json({
    success: true,
    message: "Dashboard stats fetched successfully",
    data: {
      project,
      upcomingDeadlines,
      totalProjects,
      pendingProjects,
      topNotifications,
      feedbackNotification,
      supervisorName,
    },
  });
});

export const getFeedback = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const studentId = req.user._id;

  const project = await projectServices.getProjectById(projectId);

  if (!project || project.student._id.toString() !== studentId.toString()) {
    return next(
      new ErrorHandler("Not authorized to view feedback for this project", 401),
    );
  }

  const sortedFeedback = project.feedback.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  ).map((feedback) => ({
    _id: feedback._id,
    title: feedback.title,
    message: feedback.message,
    createdAt: feedback.createdAt,
    type: feedback.type,
    supervisorName: feedback.supervisorId?.name,
    supervisorEmail: feedback.supervisorId?.email,
  }));


  res.status(200).json({
    success: true,
    message: "Feedback fetched successfully",
    data: { feedback: sortedFeedback },
  });
});

export const downloadFile = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const studentId = req.user._id;

  const project = await projectServices.getProjectById(projectId);
  if (!project) return next(new ErrorHandler("Project not found", 404));
  
  if (project.student._id.toString() !== studentId.toString()) {
    return next(
      new ErrorHandler(
        "Not authorized to download files for this project",
        401,
      ),
    );
  }

  // Find the file inside the project's files array
  const file = project.files.id(fileId);
  if (!file) return next(new ErrorHandler("File not found", 404));

  // ✨ THE CLOUDINARY MAGIC TRICK ✨
  // By injecting 'fl_attachment', Cloudinary forces the browser to download it!
  // Example: /image/upload/v1234/file.pdf -> /image/upload/fl_attachment/v1234/file.pdf
  const directDownloadUrl = file.fileUrl.replace("/upload/", "/upload/fl_attachment/");

  return res.status(200).json({
    success: true,
    fileUrl: directDownloadUrl, // Send the modified URL!
    fileName: file.fileName,
  });
});
