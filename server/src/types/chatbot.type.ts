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

export interface ChatResponse {
  success: boolean;
  message: string;
  response?: string;
  functionCalls?: Array<{
    name: string;
    args: Record<string, unknown>;
    result: unknown;
  }>;
}

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
}

export interface ToolResult {
  name: string;
  args: Record<string, unknown>;
  result: unknown;
  success: boolean;
  error?: string;
}
