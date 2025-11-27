import axios from "axios";
import envConfig from "@/lib/env";
import type { MentorListResponse } from "@/types";

const BASE_URL = envConfig.VITE_API_ENDPOINT + "/api/filter";

//API FILTER MENTOR
export async function getFilteredMentors(
  page = 1,
  limit = 10,
  skillIds?: string,
  jobTitleIds?: string,
  companyIds?: string,
  countries?: string,
  languages?: string,
  minPrice?: string,
  maxPrice?: string,
  minRating?: string
): Promise<MentorListResponse> {
  const res = await axios.get<MentorListResponse>(`${BASE_URL}/mentors`, {
    params: {
      page,
      limit,
      skillIds,
      jobTitleIds,
      companyIds,
      countries,
      languages,
      minPrice,
      maxPrice,
      minRating,
    },
    withCredentials: true,
  });
  return res.data;
}
