import process from "process";
import dotenv from "dotenv";
dotenv.config();

export function generateForgotPasswordTemplate(name, resetLink) {
  const year = new Date().getFullYear();

  return `
  <!DOCTYPE html>
  <html>
    <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);overflow:hidden;">

        <div style="background:#4f46e5;color:#ffffff;padding:20px;text-align:center;">
          <h2 style="margin:0;">🔐 Password Reset Request</h2>
        </div>

        <div style="padding:28px;color:#333;">
          <p>Hi <strong>${name}</strong> 👋</p>

          <p>
            Forgot your password? No worries 😌  
            Click the button below to set a new one.
          </p>

          <div style="text-align:center;margin:24px 0;">
            <a href="${resetLink}"
              style="background:#4f46e5;color:#ffffff;text-decoration:none;
                     padding:12px 24px;border-radius:6px;font-weight:bold;display:inline-block;">
              🔁 Reset Password
            </a>
          </div>

          <p style="font-size:14px;color:#555;">
            ⏳ This link is valid for a limited time.
          </p>
          // Add word-break: break-all; to prevent long links from breaking the mobile view
          <p style="font-size:14px;color:#555;word-break: break-all;">
           ${resetLink}
          </p>

          <p style="font-size:14px;color:#555;">
            ❗ Didn’t request this? You can safely ignore this email.
          </p>

          <p>
            Cheers,<br/>
            🚀 <strong>Project Management System Team</strong>
          </p>
        </div>

        <div style="background:#f9fafb;text-align:center;padding:14px;font-size:13px;color:#6b7280;">
          <p style="margin:0;">© ${year} Project Management System</p>
          <p style="margin:4px 0;">Built with ❤️ & ☕</p>
        </div>

      </div>
    </body>
  </html>
  `;
}

/**
 * Request Accepted Email
 */
export function generateRequestAcceptedTemplate(supervisorName) {
  // You can replace this link with your actual frontend URL!
  const dashboardLink = "http://localhost:5173/student/dashboard";

  return `
    <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155;">
      
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
        
        <div style="height: 6px; background: linear-gradient(to right, #10b981, #34d399);"></div>

        <div style="padding: 40px 30px;">
          
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #ecfdf5; border-radius: 50px; padding: 16px;">
              <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Success" width="40" height="40" style="display: block;" />
            </div>
          </div>

          <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 800; color: #0f172a; text-align: center; letter-spacing: -0.5px;">
            Request Accepted!
          </h2>

          <p style="font-size: 16px; line-height: 1.6; color: #475569; text-align: center; margin-bottom: 24px;">
            Great news! Your project supervisor request has been officially accepted by <strong style="color: #10b981; font-weight: 700;">${supervisorName}</strong>.
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 30px;">
            <p style="margin: 0; font-size: 15px; color: #334155; font-weight: 500; line-height: 1.5;">
              🚀 Your workspace is now unlocked! You can log in to start submitting files and collaborating on your final project.
            </p>
          </div>

          <div style="text-align: center;">
            <a href="${dashboardLink}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; padding: 14px 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);">
              Go to Dashboard
            </a>
          </div>

        </div>

        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 13px; color: #94a3b8; font-weight: 500;">
            Project Management System &copy; ${new Date().getFullYear()}
          </p>
        </div>

      </div>
    </div>
  `;
}

/**
 * Request Rejected Email
 */
export function generateRequestRejectedTemplate(supervisorName) {
  // Update this to whatever route the student uses to browse teachers!
  const teachersListLink = "http://localhost:5173/student/teachers";

  return `
    <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155;">
      
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
        
        <div style="height: 6px; background: linear-gradient(to right, #ef4444, #fb7185);"></div>

        <div style="padding: 40px 30px;">
          
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #fff1f2; border-radius: 50px; padding: 16px;">
              <img src="https://cdn-icons-png.flaticon.com/512/1828/1828843.png" alt="Notice" width="40" height="40" style="display: block;" />
            </div>
          </div>

          <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 800; color: #0f172a; text-align: center; letter-spacing: -0.5px;">
            Update on your Request
          </h2>

          <p style="font-size: 16px; line-height: 1.6; color: #475569; text-align: center; margin-bottom: 24px;">
            Your recent project supervisor request has been declined by <strong style="color: #e11d48; font-weight: 700;">${supervisorName}</strong>.
          </p>

          <div style="background-color: #fff1f2; border: 1px solid #ffe4e6; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 30px;">
            <p style="margin: 0; font-size: 15px; color: #9f1239; font-weight: 500; line-height: 1.5;">
              💡 <strong>Don't worry!</strong> This usually happens when a supervisor has already reached their maximum student capacity. You can easily browse the faculty list and request a different supervisor right now.
            </p>
          </div>

          <div style="text-align: center;">
            <a href="${teachersListLink}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; padding: 14px 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);">
              Find a New Supervisor
            </a>
          </div>

        </div>

        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 13px; color: #94a3b8; font-weight: 500;">
            Project Management System &copy; ${new Date().getFullYear()}
          </p>
        </div>

      </div>
    </div>
  `;
}

//Register Email

export function generateWelcomeTemplate(userName, userRole) {
  
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const loginLink = `${baseUrl}/login`;

  // Capitalize the first letter of the role for a cleaner look
  const displayRole = userRole.charAt(0).toUpperCase() + userRole.slice(1);

  return `
    <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155;">
      
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
        
        <div style="height: 6px; background: linear-gradient(to right, #4f46e5, #9333ea);"></div>

        <div style="padding: 40px 30px;">
          
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #e0e7ff; border-radius: 50px; padding: 16px;">
              <img src="https://cdn-icons-png.flaticon.com/512/3159/3159066.png" alt="Welcome" width="45" height="45" style="display: block;" />
            </div>
          </div>

          <h2 style="margin: 0 0 16px; font-size: 26px; font-weight: 800; color: #0f172a; text-align: center; letter-spacing: -0.5px;">
            Welcome to PMS! 🎉
          </h2>

          <p style="font-size: 16px; line-height: 1.6; color: #475569; text-align: center; margin-bottom: 24px;">
            Hi <strong style="color: #4f46e5;">${userName}</strong>, we are so excited to have you on board. Your account has been successfully created and configured as a <strong>${displayRole}</strong>.
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 30px;">
            <p style="margin: 0; font-size: 15px; color: #334155; font-weight: 500; line-height: 1.5;">
              Ready to get started? Log in to your dashboard to set up your profile and explore the platform.
            </p>
          </div>

          <div style="text-align: center;">
            <a href="${loginLink}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; padding: 14px 36px; border-radius: 8px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);">
              Log In to Your Account
            </a>
          </div>

        </div>

        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 13px; color: #94a3b8; font-weight: 500;">
            Project Management System &copy; ${new Date().getFullYear()}
          </p>
        </div>

      </div>
    </div>
  `;
}
