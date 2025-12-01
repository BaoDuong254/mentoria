import axios from "axios";
import envConfig from "@/lib/env";
import type { getSlotResponse } from "@/types/booking.type";

const BASE_URL = envConfig.VITE_API_ENDPOINT + "/api/slots/plans";

export async function getSlotsByPlanId(planId: number): Promise<getSlotResponse> {
  const res = await axios.get<getSlotResponse>(`${BASE_URL}/${String(planId)}`, {
    params: {
      page: 1,
      limit: 10,
      status: "Available",
    },
    withCredentials: true,
  });
  return res.data;
}
