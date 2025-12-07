import "dotenv/config";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import mailConfig from "@/mailtrap/mail.config";
import {
  BookingConfirmationData,
  MeetingLocationUpdatedData,
  MeetingCompletedData,
  MeetingCancelledData,
  MeetingReminderData,
} from "@/types/mail.type";

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

  await mailConfig(htmlToSend, email, "Mentoria Booking Confirmation");
};

export const sendMentorApproved = async (mentorName: string, email: string) => {
  const emailTemplateSource = fs.readFileSync(path.join(__dirname, "./template/mentor-accepted.hbs"), "utf8");

  const template = handlebars.compile(emailTemplateSource);
  const htmlToSend = template({ name: mentorName });

  await mailConfig(htmlToSend, email, "Mentoria Mentor Approved");
};

export const sendMentorRejected = async (mentorName: string, email: string) => {
  const emailTemplateSource = fs.readFileSync(path.join(__dirname, "./template/mentor-rejected.hbs"), "utf8");

  const template = handlebars.compile(emailTemplateSource);
  const htmlToSend = template({ name: mentorName });

  await mailConfig(htmlToSend, email, "Mentoria Mentor Application Rejected");
};

export const sendMeetingLocationUpdated = async (data: MeetingLocationUpdatedData, email: string) => {
  const emailTemplateSource = fs.readFileSync(path.join(__dirname, "./template/meeting-location-updated.hbs"), "utf8");

  const template = handlebars.compile(emailTemplateSource);
  const htmlToSend = template(data);

  await mailConfig(htmlToSend, email, "Mentoria Meeting Location Updated");
};

export const sendMeetingCompleted = async (data: MeetingCompletedData, email: string) => {
  const emailTemplateSource = fs.readFileSync(path.join(__dirname, "./template/meeting-completed.hbs"), "utf8");

  const template = handlebars.compile(emailTemplateSource);
  const htmlToSend = template(data);

  await mailConfig(htmlToSend, email, "Mentoria Meeting Completed - Share Your Feedback");
};

export const sendMeetingCancelled = async (data: MeetingCancelledData, email: string) => {
  const emailTemplateSource = fs.readFileSync(path.join(__dirname, "./template/meeting-cancelled.hbs"), "utf8");

  const template = handlebars.compile(emailTemplateSource);
  const htmlToSend = template(data);

  await mailConfig(htmlToSend, email, "Mentoria Meeting Cancelled");
};

export const sendMeetingReminder = async (data: MeetingReminderData, email: string) => {
  const emailTemplateSource = fs.readFileSync(path.join(__dirname, "./template/meeting-reminder.hbs"), "utf8");

  const template = handlebars.compile(emailTemplateSource);
  const htmlToSend = template(data);

  await mailConfig(htmlToSend, email, "Mentoria Meeting Reminder");
};
