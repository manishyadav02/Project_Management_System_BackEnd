import mongoose from "mongoose";

const deadlineSchema = new mongoose.Schema(
  {
     name: {
      type: String,
      required: [true, " name/title is required"],
      trim: true,
      maxLength: [
        100,
        "Deadline name should be less than 100 characters",
      ],
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
   createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
        required: [true, "Creator user ID is required"],
    },
  
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        default: null,
    },    
  },
  {
    timestamps: true,
  },
);

//INdexing for better query performance

deadlineSchema.index({ project: 1});
deadlineSchema.index({ dueDate: 1 });
deadlineSchema.index({ createdBy: 1});

export const Deadline =
  mongoose.models.Deadline || mongoose.model("Deadline", deadlineSchema);