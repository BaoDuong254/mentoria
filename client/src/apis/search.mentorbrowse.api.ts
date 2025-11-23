import axios from "axios";
import envConfig from "@/lib/env";
import type { searchSkillsResponse } from "@/types";

const BASE_URL = envConfig.VITE_API_ENDPOINT + "/api/search";

//API SEARCH SKILLS
export async function searchSkills(keyword: string, limit = 5): Promise<searchSkillsResponse> {
  const res = await axios.get<searchSkillsResponse>(`${BASE_URL}/skills`, {
    params: { keyword, limit },
    withCredentials: true,
    validateStatus: () => true,
  });

  return res.data;
}
