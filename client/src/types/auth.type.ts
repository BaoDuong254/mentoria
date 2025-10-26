import { type User } from "./user.type";

export interface LoginResponse {
  success: boolean;
  message: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  fetchUser: () => Promise<void>;

  //adding more feature soon...
}
