import {
  getMentorProfileService,
  updateMentorProfileService,
  getMentorsListService,
  getMentorStatsService,
  getAllPlansService,
  getPlanDetailsService,
  createPlanService,
  updatePlanService,
  deletePlanService,
} from "@/services/mentor.service";
import { UpdateMentorProfileRequest, GetMentorsQuery } from "@/types/mentor.type";
import { Request, Response } from "express";

const getMentorProfile = async (req: Request, res: Response) => {
  try {
    const { mentorId } = req.params;

    // Validate mentorId is a number
    if (!mentorId) {
      return res.status(400).json({
        success: false,
        message: "Mentor ID is required",
      });
    }

    const mentorIdNum = parseInt(mentorId);
    if (isNaN(mentorIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mentor ID",
      });
    }

    const result = await getMentorProfileService(mentorIdNum);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mentor profile retrieved successfully",
      data: result.mentor,
    });
  } catch (error) {
    console.error("Error in getMentorProfile controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateMentorProfile = async (req: Request, res: Response) => {
  try {
    const { mentorId } = req.params;

    // Validate mentorId is a number
    if (!mentorId) {
      return res.status(400).json({
        success: false,
        message: "Mentor ID is required",
      });
    }

    const mentorIdNum = parseInt(mentorId);
    if (isNaN(mentorIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mentor ID",
      });
    }

    // Check if user is authorized to update this profile
    if (req.user && parseInt(req.user.user_id) !== mentorIdNum) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this profile",
      });
    }

    const updateData: UpdateMentorProfileRequest = req.body;

    // Validate sex if provided
    if (updateData.sex && !["Male", "Female"].includes(updateData.sex)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sex value. Must be 'Male' or 'Female'",
      });
    }

    // Validate responseTime if provided (should be a string like "Within 1 hour" or "1-2 days")
    if (updateData.responseTime !== undefined && typeof updateData.responseTime !== "string") {
      return res.status(400).json({
        success: false,
        message: "Response time must be a string",
      });
    }

    const result = await updateMentorProfileService(mentorIdNum, updateData);

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
    console.error("Error in updateMentorProfile controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getMentorsList = async (req: Request, res: Response) => {
  try {
    // Parse query parameters
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    // Validate page and limit
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

    // Build query object with only defined values
    const query: GetMentorsQuery = {};
    if (page !== undefined) query.page = page;
    if (limit !== undefined) query.limit = limit;

    const result = await getMentorsListService(query);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in getMentorsList controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getMentorStats = async (req: Request, res: Response) => {
  try {
    const { mentorId } = req.params;

    // Validate mentorId is a number
    if (!mentorId) {
      return res.status(400).json({
        success: false,
        message: "Mentor ID is required",
      });
    }

    const mentorIdNum = parseInt(mentorId);
    if (isNaN(mentorIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mentor ID",
      });
    }

    const result = await getMentorStatsService(mentorIdNum);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.stats,
    });
  } catch (error) {
    console.error("Error in getMentorStats controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllPlans = async (req: Request, res: Response) => {
  try {
    const { mentorId } = req.params;

    // Validate mentorId is a number
    if (!mentorId) {
      return res.status(400).json({
        success: false,
        message: "Mentor ID is required",
      });
    }

    const mentorIdNum = parseInt(mentorId);
    if (isNaN(mentorIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mentor ID",
      });
    }

    const result = await getAllPlansService(mentorIdNum);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.plans,
    });
  } catch (error) {
    console.error("Error in getAllPlans controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getPlanDetails = async (req: Request, res: Response) => {
  try {
    const { planId } = req.params;

    // Validate planId is a number
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

    const result = await getPlanDetailsService(planIdNum);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.plan,
    });
  } catch (error) {
    console.error("Error in getPlanDetails controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const createPlan = async (req: Request, res: Response) => {
  try {
    const { mentorId } = req.params;

    // Validate mentorId is a number
    if (!mentorId) {
      return res.status(400).json({
        success: false,
        message: "Mentor ID is required",
      });
    }

    const mentorIdNum = parseInt(mentorId);
    if (isNaN(mentorIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mentor ID",
      });
    }

    // Check if user is authorized to create plans for this mentor
    if (req.user && parseInt(req.user.user_id) !== mentorIdNum) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create plans for this mentor",
      });
    }

    const planData = req.body;

    // Validate required fields
    if (!planData.planDescription || !planData.planCharge || !planData.planType) {
      return res.status(400).json({
        success: false,
        message: "Plan description, charge, and type are required",
      });
    }

    // Validate plan charge is a positive number
    if (planData.planCharge <= 0) {
      return res.status(400).json({
        success: false,
        message: "Plan charge must be a positive number",
      });
    }

    // Validate that either sessionsDuration or (callsPerMonth and minutesPerCall) are provided
    const isSessionPlan = planData.sessionsDuration !== undefined;
    const isMentorshipPlan = planData.callsPerMonth !== undefined && planData.minutesPerCall !== undefined;

    if (!isSessionPlan && !isMentorshipPlan) {
      return res.status(400).json({
        success: false,
        message: "Either sessionsDuration or (callsPerMonth and minutesPerCall) must be provided",
      });
    }

    if (isSessionPlan && isMentorshipPlan) {
      return res.status(400).json({
        success: false,
        message: "Cannot create a plan with both session and mentorship properties",
      });
    }

    // Validate session plan
    if (isSessionPlan) {
      if (planData.sessionsDuration <= 0 || planData.sessionsDuration > 120) {
        return res.status(400).json({
          success: false,
          message: "Sessions duration must be between 1 and 120 minutes",
        });
      }
    }

    // Validate mentorship plan
    if (isMentorshipPlan) {
      if (planData.callsPerMonth <= 0) {
        return res.status(400).json({
          success: false,
          message: "Calls per month must be a positive number",
        });
      }
      if (planData.minutesPerCall <= 0 || planData.minutesPerCall > 120) {
        return res.status(400).json({
          success: false,
          message: "Minutes per call must be between 1 and 120",
        });
      }
    }

    const result = await createPlanService(mentorIdNum, planData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: result.message,
      data: {
        planId: result.planId,
      },
    });
  } catch (error) {
    console.error("Error in createPlan controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updatePlan = async (req: Request, res: Response) => {
  try {
    const { mentorId, planId } = req.params;

    // Validate mentorId is a number
    if (!mentorId) {
      return res.status(400).json({
        success: false,
        message: "Mentor ID is required",
      });
    }

    const mentorIdNum = parseInt(mentorId);
    if (isNaN(mentorIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mentor ID",
      });
    }

    // Validate planId is a number
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

    // Check if user is authorized to update plans for this mentor
    if (req.user && parseInt(req.user.user_id) !== mentorIdNum) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update plans for this mentor",
      });
    }

    const updateData = req.body;

    // Validate plan charge if provided
    if (updateData.planCharge !== undefined && updateData.planCharge <= 0) {
      return res.status(400).json({
        success: false,
        message: "Plan charge must be a positive number",
      });
    }

    // Validate session duration if provided
    if (
      updateData.sessionsDuration !== undefined &&
      (updateData.sessionsDuration <= 0 || updateData.sessionsDuration > 120)
    ) {
      return res.status(400).json({
        success: false,
        message: "Sessions duration must be between 1 and 120 minutes",
      });
    }

    // Validate mentorship fields if provided
    if (updateData.callsPerMonth !== undefined && updateData.callsPerMonth <= 0) {
      return res.status(400).json({
        success: false,
        message: "Calls per month must be a positive number",
      });
    }

    if (
      updateData.minutesPerCall !== undefined &&
      (updateData.minutesPerCall <= 0 || updateData.minutesPerCall > 120)
    ) {
      return res.status(400).json({
        success: false,
        message: "Minutes per call must be between 1 and 120",
      });
    }

    const result = await updatePlanService(planIdNum, mentorIdNum, updateData);

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
    console.error("Error in updatePlan controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deletePlan = async (req: Request, res: Response) => {
  try {
    const { mentorId, planId } = req.params;

    // Validate mentorId is a number
    if (!mentorId) {
      return res.status(400).json({
        success: false,
        message: "Mentor ID is required",
      });
    }

    const mentorIdNum = parseInt(mentorId);
    if (isNaN(mentorIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mentor ID",
      });
    }

    // Validate planId is a number
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

    // Check if user is authorized to delete plans for this mentor
    if (req.user && parseInt(req.user.user_id) !== mentorIdNum) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete plans for this mentor",
      });
    }

    const result = await deletePlanService(planIdNum, mentorIdNum);

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
    console.error("Error in deletePlan controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export {
  getMentorProfile,
  updateMentorProfile,
  getMentorsList,
  getMentorStats,
  getAllPlans,
  getPlanDetails,
  createPlan,
  updatePlan,
  deletePlan,
};
