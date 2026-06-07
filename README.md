# 🎓 Project Management System (PMS)
> A full-stack, enterprise-grade academic platform designed to digitize and streamline the final-year project lifecycle for university students and faculty.
## 🚀 Overview
The Project Management System (PMS) bridges the gap between students, faculty supervisors, and university administrators. It provides a centralized dashboard for handling project proposals, secure cloud-based document submissions, deadline enforcement, and faculty evaluations. 
## 💻 Tech Stack
* **Frontend:** React.js (Vite), Redux Toolkit, Tailwind CSS
* **Backend:** Node.js, Express.js (RESTful API)
* **Database:** MongoDB & Mongoose
* **Cloud Storage:** Cloudinary
* **Email Service:** SendGrid API
## ✨ Key Features
### 👨‍🎓 Student Portal
* **Proposal Submission:** Direct routing of supervision requests to specific faculty members.
* **Secure Cloud Uploads:** Upload architecture diagrams, source code, and reports directly to the cloud.
* **Real-Time Tracking:** Monitor proposal status, supervisor feedback, and upcoming deadlines.
### 👨‍🏫 Supervisor (Teacher) Dashboard
* **Roster Management:** Accept, decline, and review student supervision requests with automated email alerts.
* **Submission Review:** Secure, forced-download mechanism for retrieving student files (PDFs, ZIPs) with guaranteed file extensions.
* **Feedback Engine:** Provide structured, milestone-based feedback to assigned students.
### 🛡️ Admin Control Panel
* **Global Oversight:** Complete visibility and management of all users, roles, and active projects.
* **Deadline Enforcement:** System-wide and project-specific deadline locks.
* **Cascade Data Management:** Advanced database cleanup that automatically removes orphaned files and requests when a user is deleted.
## 🧠 Advanced Engineering Implementations
* **API-Driven Transactional Emails:** Bypassed standard SMTP cloud firewall limitations by integrating the **SendGrid API** over HTTPS, ensuring 100% deliverability for password resets and system alerts.
* **React Blob File Downloads:** Engineered a custom file-fetching system that converts Cloudinary URLs into binary Blobs, forcing the operating system to download files with exact database filenames rather than opening them in blank browser tabs.
* **Defensive UI Rendering:** Built dynamic, state-aware frontend components that lock features based on database conditions (e.g., locking submissions post-deadline).


