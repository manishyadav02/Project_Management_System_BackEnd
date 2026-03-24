import nodeMailer from "nodemailer";
import dotenv from "dotenv";
import process from "process";

dotenv.config();

export const sendEmail = async (options) => {
    try {   
    const transporter = nodeMailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: { 
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        service: process.env.SMTP_SERVICE,
    });
    const mailOptions = {
        from: process.env.SMTP_FROM_NAME + "<" + process.env.SMTP_FROM_EMAIL + ">",
        to: options.to,
        subject: options.subject,
        html: options.message,
    };
   await transporter.sendMail(mailOptions);
        console.log("Email sent successfully"); // Added success log
        
    } catch (error) {
        console.log("Email not sent", error);
        // Important: Throw error so the controller knows it failed!
        throw error; 
    }
}