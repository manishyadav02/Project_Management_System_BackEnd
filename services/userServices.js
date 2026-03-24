import { User } from "../models/user.js";
export const createUser = async (userData) => {

  const user = new User(userData);
  await user.save();
  return user;
};

export const updateUser = async (userId, updateData) => {
  // No try-catch. Let validation errors bubble up naturally.
  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");
  
  return user;
};
export const getUserById = async (userId) => {
  // Let CastErrors bubble up to middleware
  const user = await User.findById(userId).select(
    "-password -resetPasswordToken -resetPasswordExpire",
  );
  return user;
};

export const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  return user;
};

export const getAllUsers = async () => {
  // 1. find() is empty to get ALL users
  // 2. .select() removes sensitive data
  // 3. .sort() shows newest users first
  const users = await User.find().select(
    "-password -resetPasswordToken -resetPasswordExpire"
  ).sort({ createdAt: -1 });

  return users;
};

export const assignSupervisorDirectly = async (studentId, supervisorId) => {
  const student = await User.findOne({ _id: studentId, role: "Student"});
  const supervisor = await User.findOne({ _id: supervisorId, role: "Teacher"});
  
  if (!student || !supervisor) {
    throw new Error("Student or supervisor not found");
  }
if(!supervisor.hasCapacity()){
   throw new Error("Supervisor has reached their maximum students");

}

student.supervisor = supervisorId;
supervisor.assignedStudents.push(studentId);

await Promise.all([student.save(), supervisor.save()]);

return { student, supervisor };
}
  
