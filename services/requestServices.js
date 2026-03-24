import { SupervisorRequest } from "../models/supervisorRequest.js";

export const createRequest = async (requestData) => {
  const existingRequest = await SupervisorRequest.findOne({
    student: requestData.student,
    supervisor: requestData.supervisor,
    status: "pending",
  });

  if (existingRequest) {
    throw new Error(
      "You have already sent a request to this supervisor.Please wait for the response.",
    );
  }

  const request = await SupervisorRequest.create(requestData);
  return request;
};

export const getAllRequests = async (filters) => {
  const requests = await SupervisorRequest.find(filters)
    .populate("student", "name email department")
    .populate("supervisor", "name email")
    .sort({ createdAt: -1 });

  const total = await SupervisorRequest.countDocuments(filters);

  return { requests, total };
};

export const acceptRequest = async (requestid, supervisorId) => {
  const request = await SupervisorRequest.findById(requestid)
    .populate("student", "name email supervisor project")
    .populate("supervisor", "name email assignedStudents maxStudents");

  if (!request) throw new Error("Request not found");

  if (request.supervisor._id.toString() !== supervisorId.toString()) {
    throw new Error("You are not authorized to accept this request");
  }
  if (request.status !== "pending") {
    throw new Error("This request is already accepted or rejected");
  }

  request.status = "approved";
  await request.save();

return request;
};

export const rejectRequest = async (requestid, supervisorId) => {
  const request = await SupervisorRequest.findById(requestid)
    .populate("student", "name email ")
    .populate("supervisor", "name email ");

  if (!request) throw new Error("Request not found");

  if (request.supervisor._id.toString() !== supervisorId.toString()) {
    throw new Error("You are not authorized to reject this request");
  }
  if (request.status !== "pending") {
    throw new Error("This request is already accepted or rejected");
  }

  request.status = "rejected";
  await request.save();

  return request;
};


