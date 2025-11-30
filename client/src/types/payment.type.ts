export interface CheckoutSession {
  menteeId: number;
  mentorId: number;
  planId: number;
  slotStartTime: string;
  slotEndTime: string;
  message?: string;
  discountCode?: string;
}

export interface CheckoutSessionResponse {
  success: boolean;
  message: string;
  data?: {
    sessionId?: string;
    sessionUrl?: string;
    errors?: string[];
  };
}
