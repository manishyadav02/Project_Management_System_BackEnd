
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import process from 'process';

dotenv.config();

export const sendEmail = async (options) => {
    try {   
        // 1. Authenticate with SendGrid using your API Key
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        // 2. Format the email payload
        const msg = {
            to: options.to,
            // 🚨 IMPORTANT: The 'from' email MUST be the exact one you verified in Step 1
            from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`, 
            subject: options.subject,
            html: options.message,
        };
        
        // 3. Fire it off over HTTPS!
        await sgMail.send(msg);
        console.log("✅ Email sent successfully via SendGrid API!"); 
        
    } catch (error) {
        // This will print the exact reason if SendGrid rejects it
        console.error("❌ SENDGRID ERROR:", error.response ? error.response.body : error.message);
        throw error; 
    }
}





// import nodeMailer from "nodemailer";
// import dotenv from "dotenv";
// import process from "process";

// dotenv.config();

// export const sendEmail = async (options) => {
//     try {   
//     const transporter = nodeMailer.createTransport({
//         host: process.env.SMTP_HOST,
//         port: process.env.SMTP_PORT,
//         secure: true,
//         auth: { 
//             user: process.env.SMTP_USER,
//             pass: process.env.SMTP_PASS,
//         },
//         service: process.env.SMTP_SERVICE,
//     });
//     const mailOptions = {
//         from: process.env.SMTP_FROM_NAME + "<" + process.env.SMTP_FROM_EMAIL + ">",
//         to: options.to,
//         subject: options.subject,
//         html: options.message,
//     };
//    await transporter.sendMail(mailOptions);
//         console.log("Email sent successfully"); // Added success log
        
//     } catch (error) {
//         console.log("Email not sent", error);
//         // Important: Throw error so the controller knows it failed!
//         throw error; 
//     }
// }


