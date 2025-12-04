// Admin Mentee Types
export interface AdminMenteeItem {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  goal: string | null;
}

export interface UpdateAdminMenteeRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  goal?: string;
}

// Admin Mentor Types
export interface AdminMentorItem {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  role: string;
  bio: string | null;
  cv_url: string | null;
  headline: string | null;
  response_time: string;
  created_at?: string;
}

export interface UpdateAdminMentorRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  bio?: string;
  headline?: string;
  response_time?: string;
  cv_url?: string;
}

// Review Mentor Types
export type ReviewAction = "accept" | "reject";

export interface ReviewMentorRequest {
  action: ReviewAction;
}

// Service Response Types
export interface AdminServiceResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AdminListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
}
