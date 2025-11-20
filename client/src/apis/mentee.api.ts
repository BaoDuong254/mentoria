import axios, { type AxiosInstance } from "axios";

import envConfig from "@/lib/env";
import type {
  CancelSessionResponse,
  GetMenteeSessionsQuery,
  MenteeDashboardResponse,
  MenteeProfileResponse,
  UpdateMenteeProfilePayload,
} from "@/types";

const BASE_URL = `${envConfig.VITE_API_ENDPOINT}/api/mentees`;

class MenteeAPIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
      validateStatus: () => true,
    });
  }

  async getProfile(menteeId: number): Promise<MenteeProfileResponse> {
    const res = await this.client.get<MenteeProfileResponse>(`/${String(menteeId)}`);
    if (!res.data.success) {
      throw new Error(res.data.message);
    }
    return res.data;
  }

  async updateProfile(menteeId: number, payload: UpdateMenteeProfilePayload): Promise<MenteeProfileResponse> {
    const res = await this.client.put<MenteeProfileResponse>(`/${String(menteeId)}`, payload);
    if (!res.data.success) {
      throw new Error(res.data.message);
    }
    return res.data;
  }

  async getDashboardSessions(menteeId: number, query: GetMenteeSessionsQuery = {}): Promise<MenteeDashboardResponse> {
    const res = await this.client.get<MenteeDashboardResponse>(`/${String(menteeId)}/sessions`, {
      params: query,
    });
    if (!res.data.success) {
      throw new Error(res.data.message);
    }
    return res.data;
  }

  async cancelSession(menteeId: number, sessionId: number): Promise<CancelSessionResponse> {
    const res = await this.client.post<CancelSessionResponse>(
      `/${String(menteeId)}/sessions/${String(sessionId)}/cancel`
    );
    if (!res.data.success) {
      throw new Error(res.data.message);
    }
    return res.data;
  }
}

const menteeApi = new MenteeAPIClient();

export default menteeApi;
