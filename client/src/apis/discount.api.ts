import axios from "axios";
import envConfig from "@/lib/env";

const BASE_URL = envConfig.VITE_API_ENDPOINT + "/api/discounts";

export interface DiscountItem {
  discount_id: number;
  discount_name: string;
  discount_type: string;
  discount_value: number;
  start_date: string;
  end_date: string;
  estimated_savings: number;
}

export interface BestDiscountResponse {
  success: boolean;
  data: {
    best_discount: string | null;
  };
}

export interface AllDiscountsResponse {
  success: boolean;
  data: {
    plan_charge: number;
    discounts: DiscountItem[];
  };
}

export async function getBestDiscount(menteeId: number, planId: number): Promise<BestDiscountResponse> {
  const res = await axios.get<BestDiscountResponse>(`${BASE_URL}/best`, {
    params: { mentee_id: menteeId, plan_id: planId },
    withCredentials: true,
    validateStatus: () => true,
  });
  return res.data;
}

export async function getAllDiscounts(planId: number): Promise<AllDiscountsResponse> {
  const res = await axios.get<AllDiscountsResponse>(`${BASE_URL}/all`, {
    params: { plan_id: planId },
    withCredentials: true,
    validateStatus: () => true,
  });
  return res.data;
}
