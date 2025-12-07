import axios from "axios";
import envConfig from "@/lib/env";
import type {
  CreateComplaintRequest,
  GetComplaintsResponse,
  ComplaintResponse,
  CheckExpiredPendingResponse,
} from "@/types/complaint.type";

const BASE_URL = envConfig.VITE_API_ENDPOINT + "/api/complaints";

// API CREATE COMPLAINT
export async function createComplaint(
  data: CreateComplaintRequest
): Promise<{ success: boolean; message: string; data?: ComplaintResponse }> {
  const res = await axios.post<{ success: boolean; message: string; data?: ComplaintResponse }>(BASE_URL, data, {
    withCredentials: true,
  });
  return res.data;
}

// API GET MY COMPLAINTS (for mentee)
export async function getMyComplaints(page = 1, limit = 10): Promise<GetComplaintsResponse> {
  const res = await axios.get<GetComplaintsResponse>(`${BASE_URL}/my?page=${String(page)}&limit=${String(limit)}`, {
    withCredentials: true,
  });
  return res.data;
}

// API GET MY RESOLVED COMPLAINTS (for mentee dashboard)
export async function getMyResolvedComplaints(): Promise<GetComplaintsResponse> {
  const res = await axios.get<GetComplaintsResponse>(`${BASE_URL}/my?status=Resolved&limit=100`, {
    withCredentials: true,
  });
  return res.data;
}

// API CHECK IF MEETING IS EXPIRED PENDING
export async function checkMeetingExpiredPending(meetingId: number): Promise<CheckExpiredPendingResponse> {
  const res = await axios.get<CheckExpiredPendingResponse>(`${BASE_URL}/check-expired/${String(meetingId)}`, {
    withCredentials: true,
  });
  return res.data;
}

// API GET ALL COMPLAINTS (for admin)
export async function getAllComplaints(page = 1, limit = 10, status?: string): Promise<GetComplaintsResponse> {
  let url = `${BASE_URL}?page=${String(page)}&limit=${String(limit)}`;
  if (status) {
    url += `&status=${status}`;
  }
  const res = await axios.get<GetComplaintsResponse>(url, {
    withCredentials: true,
  });
  return res.data;
}

// API GET COMPLAINT BY ID
export async function getComplaintById(complaintId: number): Promise<{ success: boolean; data: ComplaintResponse }> {
  const res = await axios.get<{ success: boolean; data: ComplaintResponse }>(`${BASE_URL}/${String(complaintId)}`, {
    withCredentials: true,
  });
  return res.data;
}

// API UPDATE COMPLAINT STATUS (for admin)
export async function updateComplaintStatus(
  complaintId: number,
  status: "Reviewed" | "Resolved" | "Rejected",
  adminResponse?: string
): Promise<{ success: boolean; message: string; data?: ComplaintResponse }> {
  const res = await axios.put<{ success: boolean; message: string; data?: ComplaintResponse }>(
    `${BASE_URL}/${String(complaintId)}/status`,
    { status, admin_response: adminResponse },
    {
      withCredentials: true,
    }
  );
  return res.data;
}

// API GET COMPLAINTS FOR MENTOR (for mentor dashboard)
export async function getComplaintsForMentor(): Promise<GetComplaintsResponse> {
  const res = await axios.get<GetComplaintsResponse>(`${BASE_URL}/mentor?limit=100`, {
    withCredentials: true,
  });
  return res.data;
}
