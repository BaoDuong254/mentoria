import "dotenv/config";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import mailConfig from "@/mailtrap/mail.config";
import { BookingConfirmationData } from "@/types/mail.type";

export const verifyMail = async (otp: string, email: string) => {
  const emailTemplateSource = fs.readFileSync(path.join(__dirname, "./template/verify-otp.hbs"), "utf8");

  const template = handlebars.compile(emailTemplateSource);
  const htmlToSend = template({ otp });

  await mailConfig(htmlToSend, email, "Mentoria Verification");
};

export const verifyResetPassword = async (resetURL: string, email: string) => {
  const emailTemplateSource = fs.readFileSync(path.join(__dirname, "./template/reset-password.hbs"), "utf8");

  const template = handlebars.compile(emailTemplateSource);
  const htmlToSend = template({ resetURL });

  await mailConfig(htmlToSend, email, "Mentoria Password Reset");
};

export const sendBookingConfirmation = async (data: BookingConfirmationData, email: string) => {
  const emailTemplateSource = fs.readFileSync(path.join(__dirname, "./template/booking-confirmation.hbs"), "utf8");

  const template = handlebars.compile(emailTemplateSource);
  const htmlToSend = template(data);

  await mailConfig(htmlToSend, email, "Booking Confirmation");
};
