import { type User } from "./user.type";

export interface LoginResponse {
  success: boolean;
  message: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  loading: boolean;
}
