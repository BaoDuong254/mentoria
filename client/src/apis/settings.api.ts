import axios from "axios";
import type {
  GetUserSettingsResponse,
  UpdateUserSettingsRequest,
  UpdateUserSettingsResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "@/types/settings.type";
import envConfig from "@/lib/env";

const BASE_URL = envConfig.VITE_API_ENDPOINT + "/api/settings";

export async function getUserSettings(): Promise<GetUserSettingsResponse> {
  const res = await axios.get<GetUserSettingsResponse>(BASE_URL, {
    withCredentials: true,
  });
  return res.data;
}

export async function updateUserSettings(data: UpdateUserSettingsRequest): Promise<UpdateUserSettingsResponse> {
  const res = await axios.put<UpdateUserSettingsResponse>(BASE_URL, data, {
    withCredentials: true,
  });
  return res.data;
}

export async function changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
  const res = await axios.put<ChangePasswordResponse>(`${BASE_URL}/change-password`, data, {
    withCredentials: true,
  });
  return res.data;
}
