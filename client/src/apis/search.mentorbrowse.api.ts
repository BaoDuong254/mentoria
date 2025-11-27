import axios from "axios";
import envConfig from "@/lib/env";
import type { searchCompaniesResponse, searchJobTitlesResponse, searchSkillsResponse } from "@/types";

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

//API SEARCH JOB TITLES
export async function searchJobTitles(keyword: string, limit = 5): Promise<searchJobTitlesResponse> {
  const res = await axios.get<searchJobTitlesResponse>(`${BASE_URL}/jobtitles`, {
    params: { keyword, limit },
    withCredentials: true,
    validateStatus: () => true,
  });
  return res.data;
}

//API SEARCH COMPANIES
export async function searchCompanies(keyword: string, limit = 5): Promise<searchCompaniesResponse> {
  const res = await axios.get<searchCompaniesResponse>(`${BASE_URL}/companies`, {
    params: { keyword, limit },
    withCredentials: true,
    validateStatus: () => true,
  });
  return res.data;
}
