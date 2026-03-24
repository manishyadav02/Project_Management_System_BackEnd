import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {CloudinaryStorage} from 'multer-storage-cloudinary'
import cloudinary from "../config/cloudinary.js";





const storage =new CloudinaryStorage({
  cloudinary,
  params:(req,file)=>{
    let folder="temp";

    if(req.route.path.includes("/upload/:projectId")){
      folder=`projects/${req.params.projectId}`;
    
    }else if(req.route.path.includes("/upload/:userId")){
      folder=`users/${req.params.userId}`;
    }
    return{
      folder,
      resource_type:"auto",
      public_id:`${Date.now()}-${file.filename}`,
    }
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/x-rar",
    "application/vnd.rar",
    "application/octet-stream",
    "image/jpeg",
    "image/png",
    "image/gif",
    "text/plain",
    "application/javascript",
    "text/css",
    "text/html",
    "application/json",
    "application/xml",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const allowedExtensions = [
    ".pdf",
    ".doc",
    ".docx",
    ".ppt",
    ".pptx",
    ".zip",
    ".rar",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".txt",
    ".js",
    ".css",
    ".html",
    ".json",
  ];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (
    allowedTypes.includes(file.mimetype) ||
    allowedExtensions.includes(fileExtension)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only documents, images, and compressed files are allowed",
      ),
      false,
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
});

export const handleUploadError = (err, req, res, next) => {
    if(err instanceof multer.MulterError){
        if(err.code === "LIMIT_FILE_SIZE"){
            return res.status(400).json({
                success: false,
                message: "File size exceeds the limit (10MB)",
            });
        } if(err.code === "LIMIT_FILE_COUNT"){
            return res.status(400).json({
                success: false,
                message: "Too many files. Maximum 10 files allowed",
            });
        }
        

        
        if(err.message && err.message.includes("Invalid file type")){
            return res.status(400).json({
                success:false,
                error: err.message,
            });
        }
        return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
};

export default upload;
