import axios from "axios";
import type { User, LoginResponse } from "@/types";

const BASE_URL = "http://localhost:3000/api/auth";

//API LOGIN
export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await axios.post<LoginResponse>(`${BASE_URL}/login`, new URLSearchParams({ email, password }), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    withCredentials: true,
    validateStatus: () => true,
  });

  return res.data;
}

//API GETME
export async function getMe(): Promise<User> {
  const res = await axios.get<User>(`${BASE_URL}/me`, {
    withCredentials: true,
  });
  return res.data;
}
