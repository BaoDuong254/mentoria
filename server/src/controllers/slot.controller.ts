import { Request, Response } from "express";
import {
  createSlotService,
  getSlotsService,
  getSlotService,
  updateSlotService,
  deleteSlotService,
} from "@/services/slot.service";
import { CreateSlotRequest, GetSlotsQuery, UpdateSlotRequest } from "@/types/slot.type";

const createSlot = async (req: Request, res: Response) => {
  try {
    const { planId } = req.params;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required",
      });
    }

    const planIdNum = parseInt(planId);
    if (isNaN(planIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan ID",
      });
    }

    const slotData: CreateSlotRequest = req.body;

    // Validate required fields
    if (!slotData.startTime || !slotData.endTime || !slotData.date) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: startTime, endTime, and date are required",
      });
    }

    // Validate status if provided
    if (slotData.status && !["Available", "Booked", "Cancelled"].includes(slotData.status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'Available', 'Booked', or 'Cancelled'",
      });
    }

    const result = await createSlotService(planIdNum, slotData, req.user?.user_id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in createSlot controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getSlots = async (req: Request, res: Response) => {
  try {
    const { planId } = req.params;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required",
      });
    }

    const planIdNum = parseInt(planId);
    if (isNaN(planIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan ID",
      });
    }

    // Parse query parameters
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    // Validate pagination parameters
    if (page !== undefined && (isNaN(page) || page < 1)) {
      return res.status(400).json({
        success: false,
        message: "Invalid page number. Must be a positive integer.",
      });
    }

    if (limit !== undefined && (isNaN(limit) || limit < 1 || limit > 100)) {
      return res.status(400).json({
        success: false,
        message: "Invalid limit. Must be between 1 and 100.",
      });
    }

    // Validate status if provided
    const status = req.query.status as string | undefined;
    if (status && !["Available", "Booked", "Cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'Available', 'Booked', or 'Cancelled'",
      });
    }

    // Build query object
    const query: GetSlotsQuery = {};
    if (page !== undefined) query.page = page;
    if (limit !== undefined) query.limit = limit;
    if (status) query.status = status as "Available" | "Booked" | "Cancelled";

    const result = await getSlotsService(planIdNum, query);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in getSlots controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getSlot = async (req: Request, res: Response) => {
  try {
    const { planId } = req.params;
    const { startTime, endTime, date } = req.query;

    if (!planId || !startTime || !endTime || !date) {
      return res.status(400).json({
        success: false,
        message: "All slot identifiers are required: planId, startTime, endTime, date",
      });
    }

    const planIdNum = parseInt(planId);
    if (isNaN(planIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan ID",
      });
    }

    const result = await getSlotService(planIdNum, startTime as string, endTime as string, date as string);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.slot,
    });
  } catch (error) {
    console.error("Error in getSlot controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateSlot = async (req: Request, res: Response) => {
  try {
    const { planId } = req.params;
    const { startTime, endTime, date } = req.query;

    if (!planId || !startTime || !endTime || !date) {
      return res.status(400).json({
        success: false,
        message: "All slot identifiers are required: planId, startTime, endTime, date",
      });
    }

    const planIdNum = parseInt(planId);
    if (isNaN(planIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan ID",
      });
    }

    const updateData: UpdateSlotRequest = req.body;

    // Validate status if provided
    if (updateData.status && !["Available", "Booked", "Cancelled"].includes(updateData.status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'Available', 'Booked', or 'Cancelled'",
      });
    }

    // Validate that status is provided for update
    if (!updateData.status) {
      return res.status(400).json({
        success: false,
        message: "Status is required for update",
      });
    }

    const result = await updateSlotService(
      planIdNum,
      startTime as string,
      endTime as string,
      date as string,
      updateData,
      req.user?.user_id
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in updateSlot controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteSlot = async (req: Request, res: Response) => {
  try {
    const { planId } = req.params;
    const { startTime, endTime, date } = req.query;

    if (!planId || !startTime || !endTime || !date) {
      return res.status(400).json({
        success: false,
        message: "All slot identifiers are required: planId, startTime, endTime, date",
      });
    }

    const planIdNum = parseInt(planId);
    if (isNaN(planIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan ID",
      });
    }

    const result = await deleteSlotService(
      planIdNum,
      startTime as string,
      endTime as string,
      date as string,
      req.user?.user_id
    );

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in deleteSlot controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { createSlot, getSlots, getSlot, updateSlot, deleteSlot };
