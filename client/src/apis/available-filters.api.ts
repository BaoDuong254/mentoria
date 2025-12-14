import axios from "axios";
import envConfig from "@/lib/env";

const BASE_URL = envConfig.VITE_API_ENDPOINT + "/api/filter";

interface AvailableFiltersResponse {
  success: boolean;
  data?: {
    countries: string[];
    languages: string[];
  };
  message?: string;
}

export const getAvailableFilters = async (): Promise<AvailableFiltersResponse> => {
  const res = await axios.get<AvailableFiltersResponse>(`${BASE_URL}/available`);
  return res.data;
};
