import axios from "axios";
import envConfig from "@/lib/env";
import type { getSlotResponse } from "@/types/booking.type";

const BASE_URL = envConfig.VITE_API_ENDPOINT + "/api/slots/plans";

export interface CreateSlotRequest {
  startTime: string;
  endTime: string;
  date: string;
  status?: "Available" | "Booked" | "Cancelled";
}

export interface SlotData {
  start_time: string;
  end_time: string;
  date: string;
  mentor_id: number;
  status: "Available" | "Booked" | "Cancelled";
  plan_id: number;
}

export interface SlotApiResponse {
  success: boolean;
  data?: SlotData;
  message?: string;
}

export interface GetSlotsForMentorResponse {
  success: boolean;
  message?: string;
  data?: {
    slots: SlotData[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export async function getSlotsByPlanId(planId: number): Promise<getSlotResponse> {
  const res = await axios.get<getSlotResponse>(`${BASE_URL}/${String(planId)}`, {
    params: {
      page: 1,
      limit: 500,
      status: "Available",
    },
    withCredentials: true,
  });
  return res.data;
}

// Get all slots for a mentor by fetching from all their plans
export async function getAllSlotsByPlanId(planId: number, page = 1, limit = 100): Promise<GetSlotsForMentorResponse> {
  const res = await axios.get<GetSlotsForMentorResponse>(`${BASE_URL}/${String(planId)}`, {
    params: {
      page,
      limit,
    },
    withCredentials: true,
  });
  return res.data;
}

// Create a new slot (mentor only)
export async function createSlot(planId: number, slotData: CreateSlotRequest): Promise<SlotApiResponse> {
  const res = await axios.post<SlotApiResponse>(`${BASE_URL}/${String(planId)}`, slotData, {
    withCredentials: true,
  });
  return res.data;
}

// Delete a slot (mentor only)
export async function deleteSlot(
  planId: number,
  startTime: string,
  endTime: string,
  date: string
): Promise<{ success: boolean; message: string }> {
  const res = await axios.delete<{ success: boolean; message: string }>(`${BASE_URL}/${String(planId)}/slot`, {
    params: { startTime, endTime, date },
    withCredentials: true,
  });
  return res.data;
}
