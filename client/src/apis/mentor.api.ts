import axios from "axios";
import envConfig from "@/lib/env";
import type { getMentorProfileResponse, MentorListResponse } from "@/types";

const BASE_URL = envConfig.VITE_API_ENDPOINT + "/api/mentors";

//API GET MENTOR LIST
export async function getMentorList(page = 1, limit = 10): Promise<MentorListResponse> {
  const res = await axios.get<MentorListResponse>(BASE_URL, {
    params: { page, limit },
    withCredentials: true,
  });
  return res.data;
}

//API GET MENTOR PROFILE
export async function getMentor(id: number | string): Promise<getMentorProfileResponse> {
  const res = await axios.get<getMentorProfileResponse>(`${BASE_URL}/${String(id)}`, {
    withCredentials: true,
  });

  return res.data;
}
