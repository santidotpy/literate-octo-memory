import nodeMailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.TESTING_EMAIL,
    pass: process.env.TESTING_EMAIL_PASSWORD,
  },
});

export const sendEmail = async (email, receipt) => {
  const mailOptions = {
    from: process.env.APP_MAIL_SENDER,
    to: email,
    subject: "Your Purchase Receipt",
    text: receipt,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};
