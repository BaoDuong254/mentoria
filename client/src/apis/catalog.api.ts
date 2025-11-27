import axios from "axios";
import envConfig from "@/lib/env";
import type { getCompaniesListResponse, getJobTitlesListResponse, getSkillsListResponse } from "@/types";

const BASE_URL = envConfig.VITE_API_ENDPOINT + "/api/catalog";

//API GET JOB TITLES
export async function getSkillsList(page: number, limit: number): Promise<getSkillsListResponse> {
  const res = await axios.get<getSkillsListResponse>(`${BASE_URL}/skills`, {
    params: { page, limit },
    withCredentials: true,
  });
  return res.data;
}

//API GET JOB TITLES
export async function getJobTitlesList(page: number, limit: number): Promise<getJobTitlesListResponse> {
  const res = await axios.get<getJobTitlesListResponse>(`${BASE_URL}/jobtitles`, {
    params: { page, limit },
    withCredentials: true,
  });
  return res.data;
}

//API GET COMPANIES
export async function getCompaniesList(page: number, limit: number): Promise<getCompaniesListResponse> {
  const res = await axios.get<getCompaniesListResponse>(`${BASE_URL}/companies`, {
    params: { page, limit },
    withCredentials: true,
  });
  return res.data;
}
