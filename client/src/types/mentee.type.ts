export type DashboardSessionStatus = "accepted" | "payment_required" | "pending" | "completed" | "cancelled";

export interface MenteeDashboardSession {
  sessionId: number;
  planId: number;
  mentorId: number;
  mentorName: string;
  mentorAvatar: string | null;
  mentorHeadline: string | null;
  topic: string;
  sessionDate: string; // ISO date string YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  ratePerHour: number;
  sessionPrice: number;
  currency: string;
  location: string | null;
  status: DashboardSessionStatus;
  paymentStatus: "paid" | "unpaid" | "refunded";
  joinUrl?: string | null;
  notes?: string | null;
}

export interface MenteeProfile {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  country: string | null;
  timezone: string | null;
  goal: string | null;
}

export interface UpdateMenteeProfilePayload {
  firstName?: string;
  lastName?: string;
  sex?: string;
  country?: string;
  timezone?: string;
  goal?: string;
}

export interface BaseMenteeResponse {
  success: boolean;
  message: string;
}

export interface MenteeProfileResponse extends BaseMenteeResponse {
  data?: {
    mentee: MenteeProfile;
  };
}

export interface GetMenteeSessionsQuery {
  startDate?: string;
  endDate?: string;
  month?: number;
  year?: number;
  status?: DashboardSessionStatus;
}

export interface MenteeDashboardResponse extends BaseMenteeResponse {
  data: {
    sessions: MenteeDashboardSession[];
  };
}

export interface CancelSessionResponse extends BaseMenteeResponse {
  data?: {
    session: MenteeDashboardSession;
  };
}
