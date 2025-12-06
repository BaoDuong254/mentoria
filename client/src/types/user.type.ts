export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  sex: string | null;
  created_at: string;
  updated_at: string | null;
  email: string;
  avatar_url: string | null;
  country: string | null;
  role: string;
  timezone: string | null;
  status: string;
  google_id: string | null;
  provider: string;
}

export interface uploadAvatarResponse {
  success: boolean;
  message: string;
  data: {
    avatar_url: string;
  };
}
