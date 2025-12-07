import poolPromise from "@/config/database";
import { MeetingResponse, MeetingListResponse } from "@/types/meeting.type";
import sql from "mssql";
import envConfig from "@/config/env";
import { sendMeetingLocationUpdated, sendMeetingCompleted, sendMeetingCancelled } from "@/mailtrap/mailSend";
import { MeetingLocationUpdatedData, MeetingCompletedData, MeetingCancelledData } from "@/types/mail.type";

export const getMeetingsByMenteeIdService = async (
  menteeId: number,
  page: number = 1,
  limit: number = 10
): Promise<MeetingListResponse> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await pool.request().input("menteeId", sql.Int, menteeId).query(`
      SELECT COUNT(*) as total
      FROM meetings m
      INNER JOIN invoices i ON m.invoice_id = i.invoice_id AND m.plan_registerations_id = i.plan_registerations_id
      WHERE i.mentee_id = @menteeId
    `);
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated results
    const result = await pool
      .request()
      .input("menteeId", sql.Int, menteeId)
      .input("limit", sql.Int, limit)
      .input("offset", sql.Int, offset).query(`
      SELECT
        m.meeting_id,
        m.invoice_id,
        m.plan_registerations_id,
        m.status,
        m.location,
        m.review_link,
        m.start_time,
        m.end_time,
        m.date,
        m.mentor_id,
        mentor_user.first_name AS mentor_first_name,
        mentor_user.last_name AS mentor_last_name,
        mentor_user.avatar_url AS mentor_avatar_url,
        mentor_user.email AS mentor_email,
        i.mentee_id,
        mentee_user.first_name AS mentee_first_name,
        mentee_user.last_name AS mentee_last_name,
        mentee_user.avatar_url AS mentee_avatar_url,
        mentee_user.email AS mentee_email,
        p.plan_type,
        p.plan_description,
        p.plan_charge,
        i.amount_total AS amount_paid
      FROM meetings m
      INNER JOIN invoices i ON m.invoice_id = i.invoice_id AND m.plan_registerations_id = i.plan_registerations_id
      INNER JOIN users mentor_user ON m.mentor_id = mentor_user.user_id
      INNER JOIN users mentee_user ON i.mentee_id = mentee_user.user_id
      INNER JOIN bookings b ON i.plan_registerations_id = b.plan_registerations_id AND i.mentee_id = b.mentee_id
      INNER JOIN plans p ON b.plan_id = p.plan_id
      WHERE i.mentee_id = @menteeId
      ORDER BY m.date DESC, m.start_time DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `);

    return {
      success: true,
      message: "Meetings retrieved successfully",
      data: result.recordset,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Error in getMeetingsByMenteeIdService:", error);
    throw error;
  }
};

export const getMeetingsByMentorIdService = async (
  mentorId: number,
  page: number = 1,
  limit: number = 10
): Promise<MeetingListResponse> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await pool.request().input("mentorId", sql.Int, mentorId).query(`
      SELECT COUNT(*) as total
      FROM meetings m
      WHERE m.mentor_id = @mentorId
    `);
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated results
    const result = await pool
      .request()
      .input("mentorId", sql.Int, mentorId)
      .input("limit", sql.Int, limit)
      .input("offset", sql.Int, offset).query(`
      SELECT
        m.meeting_id,
        m.invoice_id,
        m.plan_registerations_id,
        m.status,
        m.location,
        m.review_link,
        m.start_time,
        m.end_time,
        m.date,
        m.mentor_id,
        mentor_user.first_name AS mentor_first_name,
        mentor_user.last_name AS mentor_last_name,
        mentor_user.avatar_url AS mentor_avatar_url,
        mentor_user.email AS mentor_email,
        i.mentee_id,
        mentee_user.first_name AS mentee_first_name,
        mentee_user.last_name AS mentee_last_name,
        mentee_user.avatar_url AS mentee_avatar_url,
        mentee_user.email AS mentee_email,
        p.plan_type,
        p.plan_description,
        p.plan_charge,
        i.amount_total AS amount_paid
      FROM meetings m
      INNER JOIN invoices i ON m.invoice_id = i.invoice_id AND m.plan_registerations_id = i.plan_registerations_id
      INNER JOIN users mentor_user ON m.mentor_id = mentor_user.user_id
      INNER JOIN users mentee_user ON i.mentee_id = mentee_user.user_id
      INNER JOIN bookings b ON i.plan_registerations_id = b.plan_registerations_id AND i.mentee_id = b.mentee_id
      INNER JOIN plans p ON b.plan_id = p.plan_id
      WHERE m.mentor_id = @mentorId
      ORDER BY m.date DESC, m.start_time DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `);

    return {
      success: true,
      message: "Meetings retrieved successfully",
      data: result.recordset,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Error in getMeetingsByMentorIdService:", error);
    throw error;
  }
};

export const getMeetingByIdService = async (meetingId: number): Promise<MeetingResponse | null> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const result = await pool.request().input("meetingId", sql.Int, meetingId).query(`
      SELECT
        m.meeting_id,
        m.invoice_id,
        m.plan_registerations_id,
        m.status,
        m.location,
        m.review_link,
        m.start_time,
        m.end_time,
        m.date,
        m.mentor_id,
        mentor_user.first_name AS mentor_first_name,
        mentor_user.last_name AS mentor_last_name,
        mentor_user.avatar_url AS mentor_avatar_url,
        mentor_user.email AS mentor_email,
        i.mentee_id,
        mentee_user.first_name AS mentee_first_name,
        mentee_user.last_name AS mentee_last_name,
        mentee_user.avatar_url AS mentee_avatar_url,
        mentee_user.email AS mentee_email,
        p.plan_type,
        p.plan_description,
        p.plan_charge,
        i.amount_total AS amount_paid
      FROM meetings m
      INNER JOIN invoices i ON m.invoice_id = i.invoice_id AND m.plan_registerations_id = i.plan_registerations_id
      INNER JOIN users mentor_user ON m.mentor_id = mentor_user.user_id
      INNER JOIN users mentee_user ON i.mentee_id = mentee_user.user_id
      INNER JOIN bookings b ON i.plan_registerations_id = b.plan_registerations_id AND i.mentee_id = b.mentee_id
      INNER JOIN plans p ON b.plan_id = p.plan_id
      WHERE m.meeting_id = @meetingId
    `);

    return result.recordset.length > 0 ? result.recordset[0] : null;
  } catch (error) {
    console.error("Error in getMeetingByIdService:", error);
    throw error;
  }
};

export const updateMeetingLocationService = async (
  meetingId: number,
  mentorId: number,
  location: string
): Promise<MeetingResponse | null> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // First verify the meeting belongs to the mentor
    const verifyResult = await pool
      .request()
      .input("meetingId", sql.Int, meetingId)
      .input("mentorId", sql.Int, mentorId).query(`
      SELECT meeting_id FROM meetings
      WHERE meeting_id = @meetingId AND mentor_id = @mentorId
    `);

    if (verifyResult.recordset.length === 0) {
      return null;
    }

    // Update location and set status to Scheduled
    await pool
      .request()
      .input("meetingId", sql.Int, meetingId)
      .input("location", sql.NVarChar(255), location)
      .input("status", sql.NVarChar(20), "Scheduled").query(`
      UPDATE meetings
      SET location = @location, status = @status
      WHERE meeting_id = @meetingId
    `);

    // Get updated meeting with full details
    const updatedMeeting = await getMeetingByIdService(meetingId);

    // Send email notification to mentee
    if (envConfig.MAIL_SEND && updatedMeeting) {
      try {
        const startDateTime = new Date(updatedMeeting.start_time);
        const endDateTime = new Date(updatedMeeting.end_time);

        const emailData: MeetingLocationUpdatedData = {
          menteeName: `${updatedMeeting.mentee_first_name} ${updatedMeeting.mentee_last_name}`,
          mentorName: `${updatedMeeting.mentor_first_name} ${updatedMeeting.mentor_last_name}`,
          planType: updatedMeeting.plan_type,
          meetingDate: startDateTime.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          startTime: startDateTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          endTime: endDateTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          location: location,
        };

        await sendMeetingLocationUpdated(emailData, updatedMeeting.mentee_email);
        console.log(`Meeting location email sent to: ${updatedMeeting.mentee_email}`);
      } catch (emailError) {
        console.error("Error sending meeting location email:", emailError);
        // Don't fail the entire operation if email fails
      }
    }

    return updatedMeeting;
  } catch (error) {
    console.error("Error in updateMeetingLocationService:", error);
    throw error;
  }
};

export const updateMeetingStatusService = async (
  meetingId: number,
  mentorId: number,
  status: "Scheduled" | "Completed" | "Cancelled"
): Promise<MeetingResponse | null> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // First verify the meeting belongs to the mentor
    const verifyResult = await pool
      .request()
      .input("meetingId", sql.Int, meetingId)
      .input("mentorId", sql.Int, mentorId).query(`
      SELECT meeting_id, status FROM meetings
      WHERE meeting_id = @meetingId AND mentor_id = @mentorId
    `);

    if (verifyResult.recordset.length === 0) {
      return null;
    }

    // Update status
    await pool.request().input("meetingId", sql.Int, meetingId).input("status", sql.NVarChar(20), status).query(`
      UPDATE meetings
      SET status = @status
      WHERE meeting_id = @meetingId
    `);

    // Get updated meeting with full details
    const updatedMeeting = await getMeetingByIdService(meetingId);

    // Send email notification to mentee based on status
    if (envConfig.MAIL_SEND && updatedMeeting) {
      try {
        const startDateTime = new Date(updatedMeeting.start_time);
        const endDateTime = new Date(updatedMeeting.end_time);

        const commonData = {
          menteeName: `${updatedMeeting.mentee_first_name} ${updatedMeeting.mentee_last_name}`,
          mentorName: `${updatedMeeting.mentor_first_name} ${updatedMeeting.mentor_last_name}`,
          planType: updatedMeeting.plan_type,
          meetingDate: startDateTime.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          startTime: startDateTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          endTime: endDateTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        if (status === "Completed") {
          const emailData: MeetingCompletedData = {
            ...commonData,
            feedbackUrl: `${envConfig.CLIENT_URL}/mentee/feedback/${updatedMeeting.mentor_id}`,
          };
          await sendMeetingCompleted(emailData, updatedMeeting.mentee_email);
          console.log(`Meeting completed email sent to: ${updatedMeeting.mentee_email}`);
        } else if (status === "Cancelled") {
          const emailData: MeetingCancelledData = {
            ...commonData,
            refundNote: "Please contact support for refund information if applicable.",
            exploreMentorsUrl: `${envConfig.CLIENT_URL}/mentors`,
          };
          await sendMeetingCancelled(emailData, updatedMeeting.mentee_email);
          console.log(`Meeting cancelled email sent to: ${updatedMeeting.mentee_email}`);
        }
      } catch (emailError) {
        console.error("Error sending meeting status email:", emailError);
        // Don't fail the entire operation if email fails
      }
    }

    return updatedMeeting;
  } catch (error) {
    console.error("Error in updateMeetingStatusService:", error);
    throw error;
  }
};

/**
 * Update meeting review link
 * Only mentor can update this after meeting is completed
 */
export const updateMeetingReviewLinkService = async (
  meetingId: number,
  mentorId: number,
  reviewLink: string
): Promise<MeetingResponse | null> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // First verify the meeting belongs to the mentor
    const verifyResult = await pool
      .request()
      .input("meetingId", sql.Int, meetingId)
      .input("mentorId", sql.Int, mentorId).query(`
      SELECT meeting_id, status FROM meetings 
      WHERE meeting_id = @meetingId AND mentor_id = @mentorId
    `);

    if (verifyResult.recordset.length === 0) {
      return null;
    }

    // Update review_link
    await pool.request().input("meetingId", sql.Int, meetingId).input("reviewLink", sql.NVarChar(500), reviewLink)
      .query(`
      UPDATE meetings 
      SET review_link = @reviewLink
      WHERE meeting_id = @meetingId
    `);

    // Return updated meeting
    return await getMeetingByIdService(meetingId);
  } catch (error) {
    console.error("Error in updateMeetingReviewLinkService:", error);
    throw error;
  }
};
