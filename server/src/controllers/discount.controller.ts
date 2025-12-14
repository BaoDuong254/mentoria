import { Request, Response } from "express";
import { discountService } from "@/services/discount.service";

export const getBestDiscount = async (req: Request, res: Response) => {
  try {
    const { mentee_id, plan_id } = req.query;

    if (!mentee_id || !plan_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters",
      });
    }

    const menteeId = parseInt(mentee_id as string, 10);
    const planId = parseInt(plan_id as string, 10);

    if (isNaN(menteeId) || isNaN(planId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parameter format",
      });
    }

    const bestDiscount = await discountService.findBestDiscount(menteeId, planId);

    res.json({
      success: true,
      data: {
        best_discount: bestDiscount,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getAllDiscounts = async (req: Request, res: Response) => {
  try {
    const { plan_id } = req.query;

    if (!plan_id) {
      return res.status(400).json({
        success: false,
        message: "Missing plan_id",
      });
    }

    const planId = parseInt(plan_id as string, 10);

    if (isNaN(planId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan_id format",
      });
    }

    const result = await discountService.getAllDiscountsForPlan(planId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
