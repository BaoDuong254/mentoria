import poolPromise from "@/config/database";
import { CreateSlotRequest, GetSlotsQuery, SlotWithPlanDetails, UpdateSlotRequest } from "@/types/slot.type";

// Generate a unique slot_id from composite key for frontend mapping
const generateSlotId = (mentorId: number, startTime: Date, endTime: Date, date: Date): string => {
  const formatDate = (d: Date) => d.toISOString();
  return `${mentorId}_${formatDate(startTime)}_${formatDate(endTime)}_${formatDate(date)}`;
};

const checkSlotOverlap = async (
  planId: number,
  startTime: Date,
  endTime: Date,
  date: Date,
  excludeSlot?: { startTime: Date; endTime: Date; date: Date }
): Promise<boolean> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const request = pool
      .request()
      .input("planId", planId)
      .input("newStartTime", startTime)
      .input("newEndTime", endTime)
      .input("newDate", date);

    let query = `
      SELECT * FROM slots
      WHERE plan_id = @planId
        AND date = @newDate
        AND (
          (start_time < @newEndTime AND end_time > @newStartTime)
        )
    `;

    // If we're updating a slot, exclude it from the overlap check
    if (excludeSlot) {
      request
        .input("excludeStartTime", excludeSlot.startTime)
        .input("excludeEndTime", excludeSlot.endTime)
        .input("excludeDate", excludeSlot.date);

      query += `
        AND NOT (
          start_time = @excludeStartTime
          AND end_time = @excludeEndTime
          AND date = @excludeDate
        )
      `;
    }

    const result = await request.query(query);
    return result.recordset.length > 0;
  } catch (error) {
    console.error("Error in checkSlotOverlap:", error);
    throw error;
  }
};

const createSlotService = async (
  planId: number,
  slotData: CreateSlotRequest,
  userId?: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // Verify plan exists and get mentor info
    const planCheck = await pool.request().input("planId", planId).query(`
        SELECT p.plan_id, p.mentor_id, u.user_id
        FROM plans p
        INNER JOIN users u ON p.mentor_id = u.user_id
        WHERE p.plan_id = @planId AND u.role = N'Mentor'
      `);

    if (planCheck.recordset.length === 0) {
      return {
        success: false,
        message: "Plan not found",
      };
    }

    const mentorId = parseInt(planCheck.recordset[0].mentor_id);

    // Check if user is authorized (must be the plan's mentor)
    if (userId && parseInt(userId) !== mentorId) {
      return {
        success: false,
        message: "You are not authorized to create slots for this plan",
      };
    }

    // Parse dates
    const startTime = new Date(slotData.startTime);
    const endTime = new Date(slotData.endTime);
    const date = new Date(slotData.date);

    // Validate dates
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()) || isNaN(date.getTime())) {
      return {
        success: false,
        message: "Invalid date format",
      };
    }

    if (startTime >= endTime) {
      return {
        success: false,
        message: "Start time must be before end time",
      };
    }

    // Calculate slot duration in minutes
    const slotDurationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

    // Check if this plan is a mentorship plan and validate duration
    const mentorshipCheck = await pool.request().input("planId", planId).query(`
      SELECT minutes_per_call
      FROM plan_mentorships
      WHERE mentorships_id = @planId
    `);

    if (mentorshipCheck.recordset.length > 0) {
      const minutesPerCall = mentorshipCheck.recordset[0].minutes_per_call;

      if (slotDurationMinutes > minutesPerCall) {
        return {
          success: false,
          message: `Slot duration (${slotDurationMinutes} minutes) exceeds the plan's maximum duration of ${minutesPerCall} minutes per call`,
        };
      }
    }

    // Check for overlapping slots
    const hasOverlap = await checkSlotOverlap(planId, startTime, endTime, date);
    if (hasOverlap) {
      return {
        success: false,
        message: "This slot overlaps with an existing slot for this plan",
      };
    }

    // Insert new slot
    await pool
      .request()
      .input("startTime", startTime)
      .input("endTime", endTime)
      .input("date", date)
      .input("mentorId", mentorId)
      .input("status", slotData.status || "Available")
      .input("planId", planId).query(`
        INSERT INTO slots (start_time, end_time, date, mentor_id, status, plan_id)
        VALUES (@startTime, @endTime, @date, @mentorId, @status, @planId)
      `);

    return {
      success: true,
      message: "Slot created successfully",
    };
  } catch (error) {
    console.error("Error in createSlotService:", error);
    throw error;
  }
};

const getSlotsService = async (
  planId: number,
  query: GetSlotsQuery
): Promise<{
  success: boolean;
  message: string;
  data?: {
    slots: SlotWithPlanDetails[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // Verify plan exists
    const planCheck = await pool
      .request()
      .input("planId", planId)
      .query("SELECT plan_id FROM plans WHERE plan_id = @planId");

    if (planCheck.recordset.length === 0) {
      return {
        success: false,
        message: "Plan not found",
      };
    }

    // Set pagination defaults
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 10;
    const offset = (page - 1) * limit;

    // Build WHERE clause conditions
    const conditions: string[] = ["s.plan_id = @planId"];
    const countRequest = pool.request().input("planId", planId);
    const mainRequest = pool.request().input("planId", planId);

    if (query.status) {
      conditions.push("s.status = @status");
      countRequest.input("status", query.status);
      mainRequest.input("status", query.status);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM slots s
      ${whereClause}
    `;

    const countResult = await countRequest.query(countQuery);
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get slots with plan details
    mainRequest.input("limit", limit);
    mainRequest.input("offset", offset);

    const slotsQuery = `
      SELECT
        s.start_time,
        s.end_time,
        s.date,
        s.mentor_id,
        s.status,
        s.plan_id,
        p.plan_description,
        p.plan_charge,
        p.plan_type
      FROM slots s
      INNER JOIN plans p ON s.plan_id = p.plan_id
      ${whereClause}
      ORDER BY s.date ASC, s.start_time ASC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const slotsResult = await mainRequest.query(slotsQuery);

    const slots: SlotWithPlanDetails[] = slotsResult.recordset.map((slot) => ({
      slot_id: generateSlotId(slot.mentor_id, slot.start_time, slot.end_time, slot.date),
      start_time: slot.start_time,
      end_time: slot.end_time,
      date: slot.date,
      mentor_id: slot.mentor_id,
      status: slot.status,
      plan_id: slot.plan_id,
      plan_description: slot.plan_description,
      plan_charge: slot.plan_charge,
      plan_type: slot.plan_type,
    }));

    return {
      success: true,
      message: "Slots retrieved successfully",
      data: {
        slots,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error in getSlotsService:", error);
    throw error;
  }
};

const getSlotService = async (
  planId: number,
  startTime: string,
  endTime: string,
  date: string
): Promise<{
  success: boolean;
  message: string;
  slot?: SlotWithPlanDetails;
}> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);
    const parsedDate = new Date(date);

    if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime()) || isNaN(parsedDate.getTime())) {
      return {
        success: false,
        message: "Invalid date format",
      };
    }

    const result = await pool
      .request()
      .input("planId", planId)
      .input("startTime", parsedStartTime)
      .input("endTime", parsedEndTime)
      .input("date", parsedDate).query(`
        SELECT
          s.start_time,
          s.end_time,
          s.date,
          s.mentor_id,
          s.status,
          s.plan_id,
          p.plan_description,
          p.plan_charge,
          p.plan_type
        FROM slots s
        INNER JOIN plans p ON s.plan_id = p.plan_id
        WHERE s.plan_id = @planId
          AND s.start_time = @startTime
          AND s.end_time = @endTime
          AND s.date = @date
      `);

    if (result.recordset.length === 0) {
      return {
        success: false,
        message: "Slot not found",
      };
    }

    const slot = result.recordset[0];

    return {
      success: true,
      message: "Slot retrieved successfully",
      slot: {
        slot_id: generateSlotId(slot.mentor_id, slot.start_time, slot.end_time, slot.date),
        start_time: slot.start_time,
        end_time: slot.end_time,
        date: slot.date,
        mentor_id: slot.mentor_id,
        status: slot.status,
        plan_id: slot.plan_id,
        plan_description: slot.plan_description,
        plan_charge: slot.plan_charge,
        plan_type: slot.plan_type,
      },
    };
  } catch (error) {
    console.error("Error in getSlotService:", error);
    throw error;
  }
};

const updateSlotService = async (
  planId: number,
  startTime: string,
  endTime: string,
  date: string,
  updateData: UpdateSlotRequest,
  userId?: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);
    const parsedDate = new Date(date);

    if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime()) || isNaN(parsedDate.getTime())) {
      return {
        success: false,
        message: "Invalid date format",
      };
    }

    // Check if slot exists and get mentor info
    const slotCheck = await pool
      .request()
      .input("planId", planId)
      .input("startTime", parsedStartTime)
      .input("endTime", parsedEndTime)
      .input("date", parsedDate).query(`
        SELECT s.*, p.mentor_id
        FROM slots s
        INNER JOIN plans p ON s.plan_id = p.plan_id
        WHERE s.plan_id = @planId
          AND s.start_time = @startTime
          AND s.end_time = @endTime
          AND s.date = @date
      `);

    if (slotCheck.recordset.length === 0) {
      return {
        success: false,
        message: "Slot not found",
      };
    }

    const mentorId = parseInt(slotCheck.recordset[0].mentor_id);

    // Check if user is authorized
    if (userId && parseInt(userId) !== mentorId) {
      return {
        success: false,
        message: "You are not authorized to update slots for this plan",
      };
    }

    // Update only status
    if (updateData.status === undefined) {
      return {
        success: false,
        message: "No valid fields to update",
      };
    }

    // Calculate slot duration in minutes
    const slotDurationMinutes = Math.round((parsedEndTime.getTime() - parsedStartTime.getTime()) / (1000 * 60));

    // Check if this plan is a mentorship plan and validate duration
    const mentorshipCheck = await pool.request().input("planId", planId).query(`
      SELECT minutes_per_call
      FROM plan_mentorships
      WHERE mentorships_id = @planId
    `);

    if (mentorshipCheck.recordset.length > 0) {
      const minutesPerCall = mentorshipCheck.recordset[0].minutes_per_call;

      if (slotDurationMinutes > minutesPerCall) {
        return {
          success: false,
          message: `Slot duration (${slotDurationMinutes} minutes) exceeds the plan's maximum duration of ${minutesPerCall} minutes per call`,
        };
      }
    }

    await pool
      .request()
      .input("status", updateData.status)
      .input("planId", planId)
      .input("startTime", parsedStartTime)
      .input("endTime", parsedEndTime)
      .input("date", parsedDate).query(`
        UPDATE slots
        SET status = @status
        WHERE plan_id = @planId
          AND start_time = @startTime
          AND end_time = @endTime
          AND date = @date
      `);

    return {
      success: true,
      message: "Slot updated successfully",
    };
  } catch (error) {
    console.error("Error in updateSlotService:", error);
    throw error;
  }
};

const deleteSlotService = async (
  planId: number,
  startTime: string,
  endTime: string,
  date: string,
  userId?: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);
    const parsedDate = new Date(date);

    if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime()) || isNaN(parsedDate.getTime())) {
      return {
        success: false,
        message: "Invalid date format",
      };
    }

    // Check if slot exists and get mentor info
    const slotCheck = await pool
      .request()
      .input("planId", planId)
      .input("startTime", parsedStartTime)
      .input("endTime", parsedEndTime)
      .input("date", parsedDate).query(`
        SELECT s.*, p.mentor_id
        FROM slots s
        INNER JOIN plans p ON s.plan_id = p.plan_id
        WHERE s.plan_id = @planId
          AND s.start_time = @startTime
          AND s.end_time = @endTime
          AND s.date = @date
      `);

    if (slotCheck.recordset.length === 0) {
      return {
        success: false,
        message: "Slot not found",
      };
    }

    const mentorId = parseInt(slotCheck.recordset[0].mentor_id);

    // Check if user is authorized
    if (userId && parseInt(userId) !== mentorId) {
      return {
        success: false,
        message: "You are not authorized to delete slots for this plan",
      };
    }

    // Check if slot is being used in any meetings
    const meetingCheck = await pool
      .request()
      .input("mentorId", mentorId)
      .input("startTime", parsedStartTime)
      .input("endTime", parsedEndTime)
      .input("date", parsedDate).query(`
        SELECT meeting_id
        FROM meetings
        WHERE mentor_id = @mentorId
          AND start_time = @startTime
          AND end_time = @endTime
          AND date = @date
      `);

    if (meetingCheck.recordset.length > 0) {
      return {
        success: false,
        message: "Cannot delete slot that is being used in a meeting. Please cancel or delete the meeting first.",
      };
    }

    // Delete the slot
    await pool
      .request()
      .input("planId", planId)
      .input("startTime", parsedStartTime)
      .input("endTime", parsedEndTime)
      .input("date", parsedDate).query(`
        DELETE FROM slots
        WHERE plan_id = @planId
          AND start_time = @startTime
          AND end_time = @endTime
          AND date = @date
      `);

    return {
      success: true,
      message: "Slot deleted successfully",
    };
  } catch (error) {
    console.error("Error in deleteSlotService:", error);
    throw error;
  }
};

export { createSlotService, getSlotsService, getSlotService, updateSlotService, deleteSlotService };
