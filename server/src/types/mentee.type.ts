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

export {};
