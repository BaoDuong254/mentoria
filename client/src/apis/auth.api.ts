import axios from "axios";
import type { LoginResponse, getMeResponse, logoutResponse } from "@/types";

// const BASE_URL = "http://localhost:3000/api/auth";
export const VITE_API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
const BASE_URL = VITE_API_ENDPOINT + "/api/auth";
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
export async function getMe(): Promise<getMeResponse> {
  const res = await axios.get<getMeResponse>(`${BASE_URL}/me`, {
    withCredentials: true,
  });
  return res.data;
}

//API LOGOUT
export async function logout(): Promise<logoutResponse> {
  const res = await axios.post<logoutResponse>(
    `${BASE_URL}/logout`,
    {},
    {
      withCredentials: true,
    }
  );

  return res.data;
}
