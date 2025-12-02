export interface SocialLink {
  platform: string;
  link: string;
}

export interface UserSettings {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
  role: string;
  bio?: string | null;
  headline?: string | null;
  social_links: SocialLink[];
  skills?: string[];
}

export interface GetUserSettingsResponse {
  success: boolean;
  message: string;
  data?: UserSettings;
}

export interface UpdateUserSettingsRequest {
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  headline?: string;
  socialLinks?: SocialLink[];
  skills?: string[];
}

export interface UpdateUserSettingsResponse {
  success: boolean;
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}
