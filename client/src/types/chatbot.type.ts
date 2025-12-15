export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  userId?: number;
  userRole?: "Mentee" | "Mentor" | "Admin";
}

export interface FunctionCall {
  name: string;
  args: Record<string, unknown>;
  result: unknown;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  response?: string;
  functionCalls?: FunctionCall[];
}

export interface HealthCheckResponse {
  success: boolean;
  message: string;
  configured: boolean;
}
