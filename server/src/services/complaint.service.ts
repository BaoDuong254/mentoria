import poolPromise from "@/config/database";
import sql from "mssql";
import type { ComplaintResponse, ComplaintListResponse } from "@/types/complaint.type";

/**
 * Create a new complaint
 */
export const createComplaintService = async (
  meetingId: number,
  menteeId: number,
  content: string
): Promise<{ success: boolean; message: string; data?: ComplaintResponse }> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // First verify the meeting exists and get mentor_id
    const meetingResult = await pool.request().input("meetingId", sql.Int, meetingId).query(`
      SELECT m.meeting_id, m.mentor_id, i.mentee_id
      FROM meetings m
      INNER JOIN invoices i ON m.invoice_id = i.invoice_id AND m.plan_registerations_id = i.plan_registerations_id
      WHERE m.meeting_id = @meetingId
    `);

    if (meetingResult.recordset.length === 0) {
      return { success: false, message: "Meeting not found" };
    }

    const meeting = meetingResult.recordset[0];

    // Verify mentee is part of this meeting
    if (meeting.mentee_id !== menteeId) {
      return { success: false, message: "You are not authorized to file a complaint for this meeting" };
    }

    // Check if a complaint already exists for this meeting by this mentee
    const existingComplaint = await pool
      .request()
      .input("meetingId", sql.Int, meetingId)
      .input("menteeId", sql.Int, menteeId).query(`
      SELECT complaint_id FROM complaints
      WHERE meeting_id = @meetingId AND mentee_id = @menteeId
    `);

    if (existingComplaint.recordset.length > 0) {
      return { success: false, message: "You have already filed a complaint for this meeting" };
    }

    // Create the complaint
    const insertResult = await pool
      .request()
      .input("meetingId", sql.Int, meetingId)
      .input("menteeId", sql.Int, menteeId)
      .input("mentorId", sql.Int, meeting.mentor_id)
      .input("content", sql.NVarChar(sql.MAX), content).query(`
      INSERT INTO complaints (meeting_id, mentee_id, mentor_id, content)
      OUTPUT INSERTED.complaint_id
      VALUES (@meetingId, @menteeId, @mentorId, @content)
    `);

    const complaintId = insertResult.recordset[0].complaint_id;

    // Get the full complaint details
    const complaint = await getComplaintByIdService(complaintId);

    if (complaint) {
      return {
        success: true,
        message: "Complaint submitted successfully",
        data: complaint,
      };
    }
    return {
      success: true,
      message: "Complaint submitted successfully",
    };
  } catch (error) {
    console.error("Error creating complaint:", error);
    throw error;
  }
};

/**
 * Get complaint by ID
 */
export const getComplaintByIdService = async (complaintId: number): Promise<ComplaintResponse | null> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const result = await pool.request().input("complaintId", sql.Int, complaintId).query(`
      SELECT 
        c.complaint_id,
        c.meeting_id,
        c.mentee_id,
        c.mentor_id,
        c.content,
        c.status,
        c.created_at,
        c.updated_at,
        c.admin_response,
        mentor.first_name AS mentor_first_name,
        mentor.last_name AS mentor_last_name,
        mentor.email AS mentor_email,
        mentor.avatar_url AS mentor_avatar_url,
        mentee.first_name AS mentee_first_name,
        mentee.last_name AS mentee_last_name,
        mentee.email AS mentee_email,
        mentee.avatar_url AS mentee_avatar_url,
        m.date AS meeting_date,
        m.start_time AS meeting_start_time,
        m.end_time AS meeting_end_time
      FROM complaints c
      INNER JOIN users mentor ON c.mentor_id = mentor.user_id
      INNER JOIN users mentee ON c.mentee_id = mentee.user_id
      INNER JOIN meetings m ON c.meeting_id = m.meeting_id
      WHERE c.complaint_id = @complaintId
    `);

    if (result.recordset.length === 0) {
      return null;
    }

    return result.recordset[0] as ComplaintResponse;
  } catch (error) {
    console.error("Error getting complaint by id:", error);
    throw error;
  }
};

/**
 * Get all complaints (for admin)
 */
export const getAllComplaintsService = async (
  page: number = 1,
  limit: number = 10,
  status?: string
): Promise<ComplaintListResponse> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const offset = (page - 1) * limit;

    // Build where clause
    let whereClause = "";
    if (status) {
      whereClause = "WHERE c.status = @status";
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM complaints c
      ${whereClause}
    `;
    const countRequest = pool.request();
    if (status) {
      countRequest.input("status", sql.NVarChar(20), status);
    }
    const countResult = await countRequest.query(countQuery);
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated results
    const dataQuery = `
      SELECT 
        c.complaint_id,
        c.meeting_id,
        c.mentee_id,
        c.mentor_id,
        c.content,
        c.status,
        c.created_at,
        c.updated_at,
        c.admin_response,
        mentor.first_name AS mentor_first_name,
        mentor.last_name AS mentor_last_name,
        mentor.email AS mentor_email,
        mentor.avatar_url AS mentor_avatar_url,
        mentee.first_name AS mentee_first_name,
        mentee.last_name AS mentee_last_name,
        mentee.email AS mentee_email,
        mentee.avatar_url AS mentee_avatar_url,
        m.date AS meeting_date,
        m.start_time AS meeting_start_time,
        m.end_time AS meeting_end_time
      FROM complaints c
      INNER JOIN users mentor ON c.mentor_id = mentor.user_id
      INNER JOIN users mentee ON c.mentee_id = mentee.user_id
      INNER JOIN meetings m ON c.meeting_id = m.meeting_id
      ${whereClause}
      ORDER BY c.created_at DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;
    const dataRequest = pool.request().input("offset", sql.Int, offset).input("limit", sql.Int, limit);
    if (status) {
      dataRequest.input("status", sql.NVarChar(20), status);
    }
    const dataResult = await dataRequest.query(dataQuery);

    return {
      success: true,
      message: "Complaints retrieved successfully",
      data: dataResult.recordset as ComplaintResponse[],
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
    console.error("Error getting all complaints:", error);
    throw error;
  }
};

/**
 * Get complaints by mentee ID
 */
export const getComplaintsByMenteeIdService = async (
  menteeId: number,
  page: number = 1,
  limit: number = 10,
  status?: string
): Promise<ComplaintListResponse> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const offset = (page - 1) * limit;

    // Build where clause
    let whereClause = "WHERE c.mentee_id = @menteeId";
    if (status) {
      whereClause += " AND c.status = @status";
    }

    // Get total count
    const countRequest = pool.request().input("menteeId", sql.Int, menteeId);
    if (status) {
      countRequest.input("status", sql.NVarChar(20), status);
    }
    const countResult = await countRequest.query(`
      SELECT COUNT(*) as total
      FROM complaints c
      ${whereClause}
    `);
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated results
    const dataRequest = pool
      .request()
      .input("menteeId", sql.Int, menteeId)
      .input("offset", sql.Int, offset)
      .input("limit", sql.Int, limit);
    if (status) {
      dataRequest.input("status", sql.NVarChar(20), status);
    }
    const dataResult = await dataRequest.query(`
      SELECT 
        c.complaint_id,
        c.meeting_id,
        c.mentee_id,
        c.mentor_id,
        c.content,
        c.status,
        c.created_at,
        c.updated_at,
        c.admin_response,
        mentor.first_name AS mentor_first_name,
        mentor.last_name AS mentor_last_name,
        mentor.email AS mentor_email,
        mentor.avatar_url AS mentor_avatar_url,
        mentee.first_name AS mentee_first_name,
        mentee.last_name AS mentee_last_name,
        mentee.email AS mentee_email,
        mentee.avatar_url AS mentee_avatar_url,
        m.date AS meeting_date,
        m.start_time AS meeting_start_time,
        m.end_time AS meeting_end_time
      FROM complaints c
      INNER JOIN users mentor ON c.mentor_id = mentor.user_id
      INNER JOIN users mentee ON c.mentee_id = mentee.user_id
      INNER JOIN meetings m ON c.meeting_id = m.meeting_id
      ${whereClause}
      ORDER BY c.created_at DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `);

    return {
      success: true,
      message: "Complaints retrieved successfully",
      data: dataResult.recordset as ComplaintResponse[],
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
    console.error("Error getting complaints by mentee id:", error);
    throw error;
  }
};

/**
 * Update complaint status (admin only)
 */
export const updateComplaintStatusService = async (
  complaintId: number,
  status: "Reviewed" | "Resolved" | "Rejected",
  adminResponse?: string
): Promise<{ success: boolean; message: string; data?: ComplaintResponse }> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // Check if complaint exists and get meeting_id
    const existingComplaint = await pool.request().input("complaintId", sql.Int, complaintId).query(`
      SELECT complaint_id, meeting_id FROM complaints WHERE complaint_id = @complaintId
    `);

    if (existingComplaint.recordset.length === 0) {
      return { success: false, message: "Complaint not found" };
    }

    const meetingId = existingComplaint.recordset[0].meeting_id;

    // Update the complaint
    await pool
      .request()
      .input("complaintId", sql.Int, complaintId)
      .input("status", sql.NVarChar(20), status)
      .input("adminResponse", sql.NVarChar(sql.MAX), adminResponse || null).query(`
      UPDATE complaints
      SET status = @status, 
          admin_response = @adminResponse,
          updated_at = GETDATE()
      WHERE complaint_id = @complaintId
    `);

    // If complaint is resolved, cancel the meeting
    if (status === "Resolved") {
      await pool.request().input("meetingId", sql.Int, meetingId).query(`
        UPDATE meetings
        SET status = N'Cancelled'
        WHERE meeting_id = @meetingId AND status = N'Pending'
      `);
    }

    // Get updated complaint
    const complaint = await getComplaintByIdService(complaintId);

    if (complaint) {
      return {
        success: true,
        message: "Complaint status updated successfully",
        data: complaint,
      };
    }
    return {
      success: true,
      message: "Complaint status updated successfully",
    };
  } catch (error) {
    console.error("Error updating complaint status:", error);
    throw error;
  }
};

/**
 * Check if a meeting has an expired pending status (> 1 minute)
 */
export const checkMeetingExpiredPendingService = async (
  meetingId: number
): Promise<{ isExpired: boolean; meetingInfo?: { mentor_id: number; start_time: Date } }> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // Calculate time difference directly in SQL to avoid timezone issues
    // Note: paid_time is stored in UTC, so we use GETUTCDATE() for comparison
    const result = await pool.request().input("meetingId", sql.Int, meetingId).query(`
      SELECT 
        m.meeting_id, 
        m.status, 
        m.mentor_id,
        m.start_time,
        m.date,
        i.paid_time as booking_time,
        GETUTCDATE() as server_time,
        DATEDIFF(SECOND, i.paid_time, GETUTCDATE()) as seconds_since_payment,
        CASE WHEN m.start_time < GETUTCDATE() THEN 1 ELSE 0 END as meeting_started
      FROM meetings m
      INNER JOIN invoices i ON m.invoice_id = i.invoice_id AND m.plan_registerations_id = i.plan_registerations_id
      WHERE m.meeting_id = @meetingId
    `);

    if (result.recordset.length === 0) {
      return { isExpired: false };
    }

    const meeting = result.recordset[0];

    // Only check for Pending meetings
    if (meeting.status !== "Pending") {
      console.log(`[checkMeetingExpiredPending] Meeting ${meetingId} is not Pending (status: ${meeting.status})`);
      return { isExpired: false };
    }

    // Use SQL-calculated values to avoid timezone issues
    const secondsSincePayment = meeting.seconds_since_payment as number;
    const minutesSincePayment = secondsSincePayment / 60;
    const expiredThresholdMinutes = 1;

    // Expired only if more than 1 minute since booking (payment)

    const isExpired = minutesSincePayment >= expiredThresholdMinutes;

    console.log(
      `[checkMeetingExpiredPending] Meeting ${meetingId}: secondsSincePayment=${secondsSincePayment}, minutesSincePayment=${minutesSincePayment.toFixed(2)}, isExpired=${isExpired}`
    );

    return {
      isExpired,
      meetingInfo: {
        mentor_id: meeting.mentor_id,
        start_time: meeting.start_time,
      },
    };
  } catch (error) {
    console.error("Error checking meeting expired pending:", error);
    throw error;
  }
};

/**
 * Get complaints by mentor ID (for mentor dashboard)
 */
export const getComplaintsByMentorIdService = async (
  mentorId: number,
  page: number = 1,
  limit: number = 10
): Promise<ComplaintListResponse> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await pool.request().input("mentorId", sql.Int, mentorId).query(`
      SELECT COUNT(*) as total
      FROM complaints
      WHERE mentor_id = @mentorId
    `);
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated results
    const dataResult = await pool
      .request()
      .input("mentorId", sql.Int, mentorId)
      .input("offset", sql.Int, offset)
      .input("limit", sql.Int, limit).query(`
      SELECT 
        c.complaint_id,
        c.meeting_id,
        c.mentee_id,
        c.mentor_id,
        c.content,
        c.status,
        c.created_at,
        c.updated_at,
        c.admin_response,
        mentor.first_name AS mentor_first_name,
        mentor.last_name AS mentor_last_name,
        mentor.email AS mentor_email,
        mentor.avatar_url AS mentor_avatar_url,
        mentee.first_name AS mentee_first_name,
        mentee.last_name AS mentee_last_name,
        mentee.email AS mentee_email,
        mentee.avatar_url AS mentee_avatar_url,
        m.date AS meeting_date,
        m.start_time AS meeting_start_time,
        m.end_time AS meeting_end_time
      FROM complaints c
      INNER JOIN users mentor ON c.mentor_id = mentor.user_id
      INNER JOIN users mentee ON c.mentee_id = mentee.user_id
      INNER JOIN meetings m ON c.meeting_id = m.meeting_id
      WHERE c.mentor_id = @mentorId
      ORDER BY c.created_at DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `);

    return {
      success: true,
      message: "Complaints retrieved successfully",
      data: dataResult.recordset as ComplaintResponse[],
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
    console.error("Error getting complaints by mentor id:", error);
    throw error;
  }
};

/**
 * Get complaint by meeting ID
 */
export const getComplaintByMeetingIdService = async (
  meetingId: number
): Promise<{ success: boolean; hasComplaint: boolean; data?: ComplaintResponse }> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const result = await pool.request().input("meetingId", sql.Int, meetingId).query(`
      SELECT 
        c.complaint_id,
        c.meeting_id,
        c.mentee_id,
        c.mentor_id,
        c.content,
        c.status,
        c.created_at,
        c.updated_at,
        c.admin_response,
        mentor.first_name AS mentor_first_name,
        mentor.last_name AS mentor_last_name,
        mentor.email AS mentor_email,
        mentor.avatar_url AS mentor_avatar_url,
        mentee.first_name AS mentee_first_name,
        mentee.last_name AS mentee_last_name,
        mentee.email AS mentee_email,
        mentee.avatar_url AS mentee_avatar_url,
        m.date AS meeting_date,
        m.start_time AS meeting_start_time,
        m.end_time AS meeting_end_time
      FROM complaints c
      INNER JOIN users mentor ON c.mentor_id = mentor.user_id
      INNER JOIN users mentee ON c.mentee_id = mentee.user_id
      INNER JOIN meetings m ON c.meeting_id = m.meeting_id
      WHERE c.meeting_id = @meetingId
    `);

    if (result.recordset.length === 0) {
      return { success: true, hasComplaint: false };
    }

    return {
      success: true,
      hasComplaint: true,
      data: result.recordset[0] as ComplaintResponse,
    };
  } catch (error) {
    console.error("Error getting complaint by meeting id:", error);
    throw error;
  }
};
