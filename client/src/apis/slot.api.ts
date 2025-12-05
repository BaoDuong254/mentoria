import axios from "axios";
import envConfig from "@/lib/env";
import type { getSlotResponse, Slot } from "@/types/booking.type";

const BASE_URL = envConfig.VITE_API_ENDPOINT + "/api/slots/plans";

// Get available slots for a plan (used by mentee booking)
export async function getSlotsByPlanId(planId: number): Promise<getSlotResponse> {
  const res = await axios.get<getSlotResponse>(`${BASE_URL}/${String(planId)}`, {
    params: {
      page: 1,
      limit: 100,
      status: "Available",
    },
    withCredentials: true,
  });
  return res.data;
}

// Get all slots for a plan (used by mentor to see all their slots)
export async function getAllSlotsByPlanId(
  planId: number,
  options?: { page?: number; limit?: number; status?: "Available" | "Booked" | "Cancelled" }
): Promise<getSlotResponse> {
  const res = await axios.get<getSlotResponse>(`${BASE_URL}/${String(planId)}`, {
    params: {
      page: options?.page ?? 1,
      limit: options?.limit ?? 100,
      ...(options?.status && { status: options.status }),
    },
    withCredentials: true,
  });
  return res.data;
}

// Get a specific slot
export async function getSlot(
  planId: number,
  startTime: string,
  endTime: string,
  date: string
): Promise<{ success: boolean; message: string; slot?: Slot }> {
  const res = await axios.get<{ success: boolean; message: string; slot?: Slot }>(
    `${BASE_URL}/${String(planId)}/slot`,
    {
      params: { startTime, endTime, date },
      withCredentials: true,
    }
  );
  return res.data;
}

// Create a new slot (mentor only)
export interface CreateSlotRequest {
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  date: string; // ISO 8601 format or YYYY-MM-DD
  status?: "Available" | "Booked" | "Cancelled";
}

export async function createSlot(
  planId: number,
  data: CreateSlotRequest
): Promise<{ success: boolean; message: string }> {
  const res = await axios.post<{ success: boolean; message: string }>(`${BASE_URL}/${String(planId)}`, data, {
    withCredentials: true,
  });
  return res.data;
}

// Update a slot (mentor only)
export interface UpdateSlotRequest {
  status?: "Available" | "Booked" | "Cancelled";
}

export async function updateSlot(
  planId: number,
  startTime: string,
  endTime: string,
  date: string,
  data: UpdateSlotRequest
): Promise<{ success: boolean; message: string }> {
  const res = await axios.put<{ success: boolean; message: string }>(`${BASE_URL}/${String(planId)}/slot`, data, {
    params: { startTime, endTime, date },
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
