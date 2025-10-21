import nodemailer from "nodemailer";
import "dotenv/config";
import envConfig from "@/config/env";

const mailConfig = async (htmlToSend: string, email: string, subject: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: envConfig.MAIL_USER,
      pass: envConfig.MAIL_PASS,
    },
  });

  const mailConfigurations = {
    from: envConfig.MAIL_USER,
    to: email,
    subject: subject,
    html: htmlToSend,
  };

  transporter.sendMail(mailConfigurations, function (error, info) {
    if (error) {
      console.log("Error while sending mail: ", error);
    } else {
      console.log("Email sent successfully: " + info.response);
    }
  });
};

export default mailConfig;
