import axios from "axios";
import envConfig from "@/lib/env";
import type { uploadAvatarResponse } from "@/types";

const BASE_URL = envConfig.VITE_API_ENDPOINT + "/api/users";

export const uploadAvatar = async (file: File): Promise<uploadAvatarResponse> => {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await axios.put<uploadAvatarResponse>(`${BASE_URL}/avatar`, formData, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
