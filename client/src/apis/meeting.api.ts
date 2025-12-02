import axios from "axios";
import envConfig from "@/lib/env";

const BASE_URL = envConfig.VITE_API_ENDPOINT + "/api/meetings";

export interface MeetingResponse {
  meeting_id: number;
  invoice_id: number;
  plan_registerations_id: number;
  status: "Pending" | "Scheduled" | "Completed" | "Cancelled";
  location: string | null;
  start_time: string;
  end_time: string;
  date: string;
  mentor_id: number;
  mentor_first_name: string;
  mentor_last_name: string;
  mentor_avatar_url: string | null;
  mentor_email: string;
  mentee_id: number;
  mentee_first_name: string;
  mentee_last_name: string;
  mentee_avatar_url: string | null;
  mentee_email: string;
  plan_type: string;
  plan_description: string;
  plan_charge: number;
  amount_paid: number;
  review_link: string | null;
}

export interface MeetingsApiResponse {
  success: boolean;
  data?: MeetingResponse[];
  message?: string;
}

export interface MeetingApiResponse {
  success: boolean;
  data?: MeetingResponse;
  message?: string;
}

// Get all meetings for the logged-in mentee
export async function getMeetingsForMentee(): Promise<MeetingsApiResponse> {
  const res = await axios.get<MeetingsApiResponse>(`${BASE_URL}/mentee`, {
    withCredentials: true,
  });
  return res.data;
}

// Get all meetings for the logged-in mentor
export async function getMeetingsForMentor(): Promise<MeetingsApiResponse> {
  const res = await axios.get<MeetingsApiResponse>(`${BASE_URL}/mentor`, {
    withCredentials: true,
  });
  return res.data;
}

// Get a single meeting by ID
export async function getMeetingById(meetingId: number): Promise<MeetingApiResponse> {
  const res = await axios.get<MeetingApiResponse>(`${BASE_URL}/${String(meetingId)}`, {
    withCredentials: true,
  });
  return res.data;
}

// Update meeting location (mentor only)
export async function updateMeetingLocation(meetingId: number, location: string): Promise<MeetingApiResponse> {
  const res = await axios.patch<MeetingApiResponse>(
    `${BASE_URL}/${String(meetingId)}/location`,
    { location },
    { withCredentials: true }
  );
  return res.data;
}

// Update meeting status (mentor only)
export async function updateMeetingStatus(
  meetingId: number,
  status: "Scheduled" | "Completed" | "Cancelled"
): Promise<MeetingApiResponse> {
  const res = await axios.patch<MeetingApiResponse>(
    `${BASE_URL}/${String(meetingId)}/status`,
    { status },
    { withCredentials: true }
  );
  return res.data;
}

// Update meeting review link (mentor only)
export async function updateMeetingReviewLink(meetingId: number, reviewLink: string): Promise<MeetingApiResponse> {
  const res = await axios.patch<MeetingApiResponse>(
    `${BASE_URL}/${String(meetingId)}/review`,
    { reviewLink },
    { withCredentials: true }
  );
  return res.data;
}
