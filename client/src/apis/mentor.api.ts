import axios from "axios";
import envConfig from "@/lib/env";
import type {
  getMentorProfileResponse,
  MentorListResponse,
  MentorPlansResponse,
  PlanDetailResponse,
  CreatePlanRequest,
  CreatePlanResponse,
  UpdatePlanRequest,
  GenericResponse,
} from "@/types";

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

  console.log(res.data);
  return res.data;
}

// API GET ALL PLANS
export async function getMentorPlans(mentorId: number | string): Promise<MentorPlansResponse> {
  const res = await axios.get<MentorPlansResponse>(`${BASE_URL}/${String(mentorId)}/plans`, {
    withCredentials: true,
  });
  return res.data;
}

// API GET PLAN DETAIL
export async function getPlanDetail(mentorId: number | string, planId: number | string): Promise<PlanDetailResponse> {
  const res = await axios.get<PlanDetailResponse>(`${BASE_URL}/${String(mentorId)}/plans/${String(planId)}`, {
    withCredentials: true,
  });
  return res.data;
}

// API CREATE NEW PLAN
export async function createMentorPlan(
  mentorId: number | string,
  data: CreatePlanRequest
): Promise<CreatePlanResponse> {
  const res = await axios.post<CreatePlanResponse>(`${BASE_URL}/${String(mentorId)}/plans`, data, {
    withCredentials: true,
  });
  return res.data;
}

// API UPDATE PLAN
export async function updateMentorPlan(
  mentorId: number | string,
  planId: number | string,
  data: UpdatePlanRequest
): Promise<GenericResponse> {
  const res = await axios.put<GenericResponse>(`${BASE_URL}/${String(mentorId)}/plans/${String(planId)}`, data, {
    withCredentials: true,
  });
  return res.data;
}

// API DELETE PLAN
export async function deleteMentorPlan(mentorId: number | string, planId: number | string): Promise<GenericResponse> {
  const res = await axios.delete<GenericResponse>(`${BASE_URL}/${String(mentorId)}/plans/${String(planId)}`, {
    withCredentials: true,
  });
  return res.data;
}
