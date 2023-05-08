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

export const sendEmail = async (email, total) => {
  const mailOptions = {
    from: process.env.APP_MAIL_SENDER,
    to: email,
    subject: "Thank you for your purchase",
    text: "Your purchase was successful",
    html: ` <h3>Your purchase was successful!</h3>
            <h4>Total: $${total}</h4>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};
