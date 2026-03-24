import ErrorHandler from "../middlewares/error.js";
import fs from "fs";

export const streamDownload = (filePath, res, fileName) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new ErrorHandler("File not found", 404);
    }

    res.download(filePath, fileName, (err) => {
      if (err) {
        throw new ErrorHandler("Error downloading file", 500);
      } else {
        console.log("File downloaded successfully");
      }
    });
  } catch (error) {
    if (error instanceof ErrorHandler) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
