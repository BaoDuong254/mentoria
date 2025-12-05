import axios from "axios";
import envConfig from "@/lib/env";
import type {
  GetMeetingsResponse,
  MeetingResponse,
  UpdateMeetingLocationRequest,
  UpdateMeetingStatusRequest,
  UpdateReviewLinkRequest,
} from "@/types/meeting.type";

const BASE_URL = envConfig.VITE_API_ENDPOINT + "/api/meetings";

// API GET MEETINGS FOR MENTEE
export async function getMeetingsForMentee(): Promise<GetMeetingsResponse> {
  const res = await axios.get<GetMeetingsResponse>(`${BASE_URL}/mentee`, {
    withCredentials: true,
  });
  return res.data;
}

// API GET MEETINGS FOR MENTOR
export async function getMeetingsForMentor(): Promise<GetMeetingsResponse> {
  const res = await axios.get<GetMeetingsResponse>(`${BASE_URL}/mentor`, {
    withCredentials: true,
  });
  return res.data;
}

// API GET MEETING BY ID
export async function getMeetingById(meetingId: number): Promise<{ success: boolean; data: MeetingResponse }> {
  const res = await axios.get<{ success: boolean; data: MeetingResponse }>(`${BASE_URL}/${String(meetingId)}`, {
    withCredentials: true,
  });
  return res.data;
}

// API UPDATE MEETING LOCATION
export async function updateMeetingLocation(
  meetingId: number,
  data: UpdateMeetingLocationRequest
): Promise<{ success: boolean; message: string }> {
  const res = await axios.patch<{ success: boolean; message: string }>(
    `${BASE_URL}/${String(meetingId)}/location`,
    data,
    {
      withCredentials: true,
    }
  );
  return res.data;
}

// API UPDATE MEETING STATUS
export async function updateMeetingStatus(
  meetingId: number,
  data: UpdateMeetingStatusRequest
): Promise<{ success: boolean; message: string }> {
  const res = await axios.patch<{ success: boolean; message: string }>(
    `${BASE_URL}/${String(meetingId)}/status`,
    data,
    {
      withCredentials: true,
    }
  );
  return res.data;
}

// API UPDATE REVIEW LINK
export async function updateReviewLink(
  meetingId: number,
  data: UpdateReviewLinkRequest
): Promise<{ success: boolean; message: string }> {
  const res = await axios.patch<{ success: boolean; message: string }>(
    `${BASE_URL}/${String(meetingId)}/review-link`,
    data,
    {
      withCredentials: true,
    }
  );
  return res.data;
}
