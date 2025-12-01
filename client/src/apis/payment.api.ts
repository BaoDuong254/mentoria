import axios from "axios";
import envConfig from "@/lib/env";
import type { CheckoutSession, CheckoutSessionResponse } from "@/types";

const BASE_URL = envConfig.VITE_API_ENDPOINT + "/api/pay";

export async function createCheckoutSession(data: CheckoutSession): Promise<CheckoutSessionResponse> {
  const res = await axios.post<CheckoutSessionResponse>(`${BASE_URL}/checkout-session`, data, {
    withCredentials: true,
  });
  return res.data;
}
