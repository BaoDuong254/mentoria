import axios from "axios";
import envConfig from "@/lib/env";
import type { ChatRequest, ChatResponse, HealthCheckResponse } from "@/types/chatbot.type";

const BASE_URL = envConfig.VITE_API_ENDPOINT + "/api/chatbot";

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const res = await axios.post<ChatResponse>(`${BASE_URL}/chat`, request, {
    withCredentials: true,
    validateStatus: () => true,
  });

  return res.data;
}

export async function checkChatbotHealth(): Promise<HealthCheckResponse> {
  const res = await axios.get<HealthCheckResponse>(`${BASE_URL}/health`, {
    withCredentials: true,
  });

  return res.data;
}
