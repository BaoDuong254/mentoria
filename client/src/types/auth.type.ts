import { type User } from "./user.type";
import type { MentorProfile } from "./mentor.type";

export interface LoginResponse {
  success: boolean;
  message: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  mentor: MentorProfile | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
  registerMentee: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<registerMenteeResponse>;
  registerMentor: (formData: FormData) => Promise<registerMentorResponse>;
  verify: (otp: string) => Promise<otpResponse>;
  //adding more feature soon...
}

export interface getMeResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export interface logoutResponse {
  success: boolean;
  message: string;
}

export interface registerMenteeResponse {
  success: boolean;
  message: string;
  data?: {
    errors?: string[];
    oldData?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
    };
  };
}

export interface registerMentorResponse {
  success: boolean;
  message: string;
  data?: {
    errors?: string[];
    oldData?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
    };
  };
}

export interface otpResponse {
  success: boolean;
  message: string;
}
