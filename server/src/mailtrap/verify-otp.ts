import nodemailer from "nodemailer";
import "dotenv/config";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import envConfig from "@/config/env";

export const verifyMail = async (otp: string, email: string) => {
  const emailTemplateSource = fs.readFileSync(path.join(__dirname, "./template/verify-otp.hbs"), "utf8");

  const template = handlebars.compile(emailTemplateSource);
  const htmlToSend = template({ otp });

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
    subject: "Mentoria Verification",
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
