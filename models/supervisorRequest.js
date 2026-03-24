import mongoose from "mongoose";

const supervisorRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, " student ID is required"],
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "supervisor ID is required"],
    },
    message: {
      type: String,
      required: [true, "Due date is required"],
      trim: true,
      maxLength: [250, "message name should be less than 250 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

//INdexing for better query performance

supervisorRequestSchema.index({ student: 1 });
supervisorRequestSchema.index({ supervisor: 1 });
supervisorRequestSchema.index({ status: 1 });

export const SupervisorRequest =
  mongoose.models.SupervisorRequest || mongoose.model("SupervisorRequest", supervisorRequestSchema);
