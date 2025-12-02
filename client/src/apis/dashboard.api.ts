import axios from "axios";
import envConfig from "@/lib/env";
import type { MenteeSessionsResponse } from "@/types/dashboard.type";

const BASE_URL = envConfig.VITE_API_ENDPOINT + "/api/mentee";

// Get all sessions for the currently logged-in mentee
export async function getMenteeSessions(): Promise<MenteeSessionsResponse> {
  const res = await axios.get<MenteeSessionsResponse>(`${BASE_URL}/sessions`, {
    withCredentials: true,
  });
  return res.data;
}

// Cancel a pending booking
export async function cancelBooking(registrationId: number): Promise<{ success: boolean; message: string }> {
  const res = await axios.delete<{ success: boolean; message: string }>(
    `${BASE_URL}/sessions/${String(registrationId)}`,
    {
      withCredentials: true,
    }
  );
  return res.data;
}
