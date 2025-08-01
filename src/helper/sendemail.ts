// helper/sendEmail.ts
import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, text: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: "your_email@gmail.com",
    to,
    subject,
    text
  };

  return await transporter.sendMail(mailOptions);
};
