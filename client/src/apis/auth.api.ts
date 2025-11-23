import axios from "axios";
import type {
  LoginResponse,
  getMeResponse,
  logoutResponse,
  registerMenteeResponse,
  otpResponse,
  registerMentorResponse,
} from "@/types";
import envConfig from "@/lib/env";

// const BASE_URL = "http://localhost:3000/api/auth";
const BASE_URL = envConfig.VITE_API_ENDPOINT + "/api/auth";
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

//API menteeRegister
export async function registerMentee(
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<registerMenteeResponse> {
  const res = await axios.post<registerMenteeResponse>(
    `${BASE_URL}/register`,
    new URLSearchParams({ firstName, lastName, email, password }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      withCredentials: true,
      validateStatus: () => true,
    }
  );
  return res.data;
}

//API mentorRegister
export async function registerMentor(formData: FormData): Promise<registerMentorResponse> {
  const res = await axios.post<registerMentorResponse>(`${BASE_URL}/mentor-register`, formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

//API verify OTP
export async function verify(otp: string): Promise<otpResponse> {
  const res = await axios.post<otpResponse>(`${BASE_URL}/verify-otp`, new URLSearchParams({ otp }), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    withCredentials: true,
    validateStatus: () => true,
  });

  return res.data;
}
