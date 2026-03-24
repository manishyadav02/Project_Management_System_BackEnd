import express from "express";
import cors from "cors";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.js";
import authRouter from "./router/userRoutes.js";
import adminRouter from "./router/adminRoutes.js";
import studentRouter from "./router/studentRoutes.js";
import teacherRouter from "./router/teacherRoutes.js";
import notificationRouter from "./router/notificationRoutes.js";
import projectRouter from "./router/projectRoutes.js";
import deadlineRouter from "./router/deadlineRoutes.js";
import process from "process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuration
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

const uploadsDir = path.join(__dirname, "uploads");
const tempDir = path.join(__dirname, "temp");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/student", studentRouter);
app.use("/api/v1/teacher", teacherRouter);
app.use("/api/v1/notification", notificationRouter);
app.use("/uploads", express.static(uploadsDir));
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/deadline", deadlineRouter);

// Middleware for handling errors
app.use(errorMiddleware);

export default app;
