export interface MenteeProfile {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  sex: string | null;
  avatar_url: string | null;
  country: string | null;
  timezone: string | null;
  goal: string | null;
  created_at?: string;
  updated_at?: string | null;
  is_email_verified?: boolean;
}

export interface UpdateMenteeProfileRequest {
  firstName?: string;
  lastName?: string;
  sex?: string;
  country?: string;
  timezone?: string;
  goal?: string;
}

export interface MenteeListItem {
  user_id: number;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  country: string | null;
  goal: string | null;
  created_at?: string;
}

export interface GetMenteesQuery {
  page?: number;
  limit?: number;
}

// Additional helpful domain types that mirror the DB tables related to mentees
export interface InvoiceItem {
  invoice_id: number;
  mentee_id: number;
  amount: number;
  paid_time: string;
}

export type SessionStatus = "Scheduled" | "Completed" | "Cancelled";

export interface SessionItem {
  plan_id: number;
  invoice_id: number;
  mentee_id: number;
  session_id: number;
  session_status: SessionStatus;
  session_location?: string | null;
  discuss_info?: string | null;
  start_time: string;
  session_date: string;
  mentor_id: number;
}

export type SentFrom = "Mentor" | "Mentee";

export interface MessageItem {
  mentee_id: number;
  mentor_id: number;
  content: string;
  sent_time: string;
  sent_from: SentFrom;
}

export interface FeedbackItem {
  mentee_id: number;
  mentor_id: number;
  stars: number;
  content: string;
  sent_time: string;
}

export {};
