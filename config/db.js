import mongoose from "mongoose";
import process from "process";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "project_management_system",
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database connection failed", error);
  }
};
