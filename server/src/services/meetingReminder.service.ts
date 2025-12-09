import cron from "node-cron";
import poolPromise from "@/config/database";
import { sendMeetingReminder } from "@/mailtrap/mailSend";
import logger from "@/utils/logger";

interface UpcomingMeeting {
  meeting_id: number;
  meeting_date: string;
  start_time: string;
  end_time: string;
  location: string;
  mentee_id: number;
  mentee_email: string;
  mentee_first_name: string;
  mentee_last_name: string;
  mentor_id: number;
  mentor_email: string;
  mentor_first_name: string;
  mentor_last_name: string;
  plan_type: string;
}

const formatTime = (time: string): string => {
  const date = new Date(time);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const calculateDuration = (startTime: string, endTime: string): string => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationInMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
  return durationInMinutes.toString();
};

const calculateTimeUntil = (meetingDateTime: Date): string => {
  const now = new Date();
  const diff = meetingDateTime.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 24) {
    return `${hours} hours`;
  } else {
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""}`;
  }
};

export const getUpcomingMeetings = async (): Promise<UpcomingMeeting[]> => {
  try {
    const pool = await poolPromise;
    if (!pool) throw new Error("Database connection not established");

    // Query meetings that are scheduled within the next 1-2 hours
    // This ensures reminders are sent close to the meeting time
    const result = await pool.request().query(`
        SELECT
          m.meeting_id,
          m.date as meeting_date,
          m.start_time,
          m.end_time,
          m.location,
          mentee_user.user_id as mentee_id,
          mentee_user.email as mentee_email,
          mentee_user.first_name as mentee_first_name,
          mentee_user.last_name as mentee_last_name,
          mentor_user.user_id as mentor_id,
          mentor_user.email as mentor_email,
          mentor_user.first_name as mentor_first_name,
          mentor_user.last_name as mentor_last_name,
          p.plan_type
        FROM meetings m
        INNER JOIN invoices i ON m.invoice_id = i.invoice_id
        INNER JOIN bookings b ON i.plan_registerations_id = b.plan_registerations_id
        INNER JOIN mentees ON b.mentee_id = mentees.user_id
        INNER JOIN users mentee_user ON mentees.user_id = mentee_user.user_id
        INNER JOIN mentors ON m.mentor_id = mentors.user_id
        INNER JOIN users mentor_user ON mentors.user_id = mentor_user.user_id
        INNER JOIN plans p ON b.plan_id = p.plan_id
        WHERE m.status = 'Scheduled'
          AND DATEADD(HOUR, DATEPART(HOUR, m.start_time),
              DATEADD(MINUTE, DATEPART(MINUTE, m.start_time),
              CAST(m.date AS DATETIME))) BETWEEN DATEADD(HOUR, 1, GETDATE()) AND DATEADD(HOUR, 2, GETDATE())
      `);

    return result.recordset;
  } catch (error) {
    logger.error("Error fetching upcoming meetings:", error);
    throw error;
  }
};

export const sendRemindersForUpcomingMeetings = async (): Promise<void> => {
  try {
    logger.info("Starting meeting reminder cron job...");

    const upcomingMeetings = await getUpcomingMeetings();

    if (upcomingMeetings.length === 0) {
      logger.info("No upcoming meetings found in the next 1-2 hours.");
      return;
    }

    logger.info(`Found ${upcomingMeetings.length} upcoming meetings. Sending reminders...`);

    for (const meeting of upcomingMeetings) {
      try {
        const meetingDateTime = new Date(meeting.start_time);
        const formattedDate = formatDate(meeting.meeting_date);
        const formattedStartTime = formatTime(meeting.start_time);
        const formattedEndTime = formatTime(meeting.end_time);
        const duration = calculateDuration(meeting.start_time, meeting.end_time);
        const timeUntil = calculateTimeUntil(meetingDateTime);

        // Send reminder to mentee
        await sendMeetingReminder(
          {
            name: `${meeting.mentee_first_name} ${meeting.mentee_last_name}`,
            date: formattedDate,
            startTime: formattedStartTime,
            endTime: formattedEndTime,
            duration,
            location: meeting.location,
            otherParty: `${meeting.mentor_first_name} ${meeting.mentor_last_name}`,
            roleLabel: "Mentor",
            timeUntil,
          },
          meeting.mentee_email
        );

        logger.info(`Sent meeting reminder to mentee: ${meeting.mentee_email} for meeting #${meeting.meeting_id}`);

        // Send reminder to mentor
        await sendMeetingReminder(
          {
            name: `${meeting.mentor_first_name} ${meeting.mentor_last_name}`,
            date: formattedDate,
            startTime: formattedStartTime,
            endTime: formattedEndTime,
            duration,
            location: meeting.location,
            otherParty: `${meeting.mentee_first_name} ${meeting.mentee_last_name}`,
            roleLabel: "Mentee",
            timeUntil,
          },
          meeting.mentor_email
        );

        logger.info(`Sent meeting reminder to mentor: ${meeting.mentor_email} for meeting #${meeting.meeting_id}`);
      } catch (error) {
        logger.error(`Error sending reminder for meeting #${meeting.meeting_id}:`, error);
      }
    }

    logger.info("Meeting reminder cron job completed successfully.");
  } catch (error) {
    logger.error("Error in meeting reminder cron job:", error);
  }
};

// Schedule cron job to run every 30 minutes
export const startMeetingReminderCron = (): void => {
  // Run every 30 minutes (at :00 and :30 of each hour)
  cron.schedule("*/30 * * * *", async () => {
    logger.info("Meeting reminder cron job triggered");
    await sendRemindersForUpcomingMeetings();
  });

  logger.info("Meeting reminder cron job scheduled - will run every 30 minutes");
};
