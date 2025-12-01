import poolPromise from "@/config/database";
import { MeetingResponse } from "@/types/meeting.type";
import sql from "mssql";

/**
 * Get all meetings for a mentee
 */
export const getMeetingsByMenteeIdService = async (menteeId: number): Promise<MeetingResponse[]> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const result = await pool.request().input("menteeId", sql.Int, menteeId).query(`
      SELECT 
        m.meeting_id,
        m.invoice_id,
        m.plan_registerations_id,
        m.status,
        m.location,
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
        i.amount AS amount_paid
      FROM meetings m
      INNER JOIN invoices i ON m.invoice_id = i.invoice_id AND m.plan_registerations_id = i.plan_registerations_id
      INNER JOIN users mentor_user ON m.mentor_id = mentor_user.user_id
      INNER JOIN users mentee_user ON i.mentee_id = mentee_user.user_id
      INNER JOIN bookings b ON i.plan_registerations_id = b.plan_registerations_id AND i.mentee_id = b.mentee_id
      INNER JOIN plans p ON b.plan_id = p.plan_id
      WHERE i.mentee_id = @menteeId
      ORDER BY m.date DESC, m.start_time DESC
    `);

    return result.recordset;
  } catch (error) {
    console.error("Error in getMeetingsByMenteeIdService:", error);
    throw error;
  }
};

/**
 * Get all meetings for a mentor
 */
export const getMeetingsByMentorIdService = async (mentorId: number): Promise<MeetingResponse[]> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const result = await pool.request().input("mentorId", sql.Int, mentorId).query(`
      SELECT 
        m.meeting_id,
        m.invoice_id,
        m.plan_registerations_id,
        m.status,
        m.location,
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
        i.amount AS amount_paid
      FROM meetings m
      INNER JOIN invoices i ON m.invoice_id = i.invoice_id AND m.plan_registerations_id = i.plan_registerations_id
      INNER JOIN users mentor_user ON m.mentor_id = mentor_user.user_id
      INNER JOIN users mentee_user ON i.mentee_id = mentee_user.user_id
      INNER JOIN bookings b ON i.plan_registerations_id = b.plan_registerations_id AND i.mentee_id = b.mentee_id
      INNER JOIN plans p ON b.plan_id = p.plan_id
      WHERE m.mentor_id = @mentorId
      ORDER BY m.date DESC, m.start_time DESC
    `);

    return result.recordset;
  } catch (error) {
    console.error("Error in getMeetingsByMentorIdService:", error);
    throw error;
  }
};

/**
 * Get a single meeting by ID
 */
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
        i.amount AS amount_paid
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

/**
 * Update meeting location and set status to Scheduled
 * Only mentor can update this
 */
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

    // Return updated meeting
    return await getMeetingByIdService(meetingId);
  } catch (error) {
    console.error("Error in updateMeetingLocationService:", error);
    throw error;
  }
};

/**
 * Update meeting status
 * Mentor can mark as Completed or Cancelled
 */
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

    // Return updated meeting
    return await getMeetingByIdService(meetingId);
  } catch (error) {
    console.error("Error in updateMeetingStatusService:", error);
    throw error;
  }
};
