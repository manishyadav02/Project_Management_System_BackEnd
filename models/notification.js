import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    message: {
      type: String,
      required: [true, " message is required"],
      trim: true,
      maxLength: [
        1000,
        "Notification message should be less than 1000 characters",
      ],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: [
        "request",
        "approval",
        "rejection",
        "feedback",
        "general",
        "meeting",
        "system",
        "deadline",
      ],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  },
);

//INdexing for better query performance

notificationSchema.index({ user: 1,isRead: 1 });


export const Notification =
  mongoose.models.Notification || mongoose.model("Notification", notificationSchema);