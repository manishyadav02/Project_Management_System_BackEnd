import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["general", "positive", "negative"],
      default: "general",
    },
    title: {
      type: String,
      required: [true, "Feedback title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Feedback message is required"],
      trim: true,
      maxLength: [2000, "Feedback message should be less than 2000 characters"],
    },
  },
  {
    timestamps: true,
  },
);

const projectSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    title: {
      type: String,

      required: [true, " Project title is required"],
      trim: true,
      maxLength: [200, "Project title should be less than 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
      maxLength: [
        2000,
        "Project description should be less than 2000 characters",
      ],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    files: [
      {
        fileType: {
          type: String,
          required: [true, "File type is required"],
        },
        fileUrl: {
          type: String,
          required: [true, "File URL is required"],
        },
        fileName: {
          type: String,
          required: [true, "File name is required"],
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    feedback: [feedbackSchema],
    deadline: {
      type: Date,
      // required: [true, "Project deadline is required"],
    },
  },
  {
    timestamps: true,
  },
);

//INdexing for better query performance

projectSchema.index({ student: 1 });
projectSchema.index({ Supervisor: 1 });
projectSchema.index({ status: 1 });
// projectSchema.index({deadline:1});

export const Project =
  mongoose.models.Project || mongoose.model("Project", projectSchema);
