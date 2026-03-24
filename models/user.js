import bcrypt from "bcrypt";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import process from "process";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxLength: [20, "Name cannot exceed 20 characters"],
      minLength: [3, "Name should have more than 3 characters"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minLength: [6, "password should be greater than 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["Student", "Admin", "Teacher"],
      default: "Student",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    department: {
      type: String,
      enum: [
        "CSE",
        "ECE",
        "MECH",
        "EE",
        "CIVIL",
        "EEE",
        "IT",
        "DIPLOMA",
        "OTHER",
      ],
      trim: true,
      default: "CSE",
    },

    expertise: {
      type: [String],
      default: [],
    },

    // FIX 1: Renamed from maxStudents to maxStudent (Singular) to match Controller
    maxStudents: {
      type: Number,
      default: 50,
      min: [1, "min Students should be at least 1"],
    },

    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        default: null,
      },
    ],
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return; // Just return. Mongoose knows you are done.
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
userSchema.methods.hasCapacity = async function () {
  if (this.role !== "Teacher") return false;
  return this.assignedStudents.length < this.maxStudents;
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

export const User = mongoose.model("User", userSchema);
