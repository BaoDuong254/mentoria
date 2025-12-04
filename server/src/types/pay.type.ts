export interface CreateCheckoutSessionRequest {
  menteeId: number;
  mentorId: number;
  planId: number;
  slotStartTime: string; // ISO 8601 datetime format
  slotEndTime: string; // ISO 8601 datetime format
  message: string;
  discountCode?: string | undefined;
}

export interface CheckoutSessionMetadata {
  menteeId: string;
  mentorId: string;
  planId: string;
  slotStartTime: string; // ISO 8601 datetime format
  slotEndTime: string; // ISO 8601 datetime format
  message: string;
  discountId?: string | null;
  [key: string]: string | null;
}

export interface DiscountDetails {
  discount_id: number;
  discount_name: string;
  discount_type: "Percentage" | "Fixed";
  discount_value: number;
  status: "Active" | "Inactive";
  usage_limit: number;
  used_count: number;
}

export interface PlanDetails {
  plan_id: number;
  plan_description: string;
  plan_charge: number;
  plan_type: string;
  mentor_id: number;
}

export interface SlotDetails {
  mentor_id: number;
  start_time: Date;
  end_time: Date;
  date: Date;
  status: "Available" | "Booked" | "Cancelled";
  plan_id: number;
}

export interface BookingValidationResult {
  isValid: boolean;
  plan?: PlanDetails | undefined;
  slot?: SlotDetails | undefined;
  discount?: DiscountDetails | undefined;
  finalAmount?: number | undefined;
  discountAmount?: number | undefined;
  error?: string | undefined;
}

export interface WebhookCheckoutSessionCompleted {
  session: {
    id: string;
    amount_total: number;
    currency: string;
    customer_email: string;
    metadata: CheckoutSessionMetadata;
  };
}

export interface CreateInvoiceData {
  sessionId: string;
  amountTotal: number;
  currency: string;
  discountAmount: number;
  finalAmount: number;
  discountId?: number | undefined;
  stripeSessionId?: string | undefined;
  stripeCustomerId?: string | undefined;
  stripeCustomerEmail?: string | undefined;
  stripePaymentIntentId?: string | undefined;
  stripeChargeId?: string | undefined;
  stripeBalanceTransactionId?: string | undefined;
  stripeReceiptUrl?: string | undefined;
  paymentStatus?: string | undefined;
  amountSubtotal?: number | undefined;
}

export interface CreateBookingData {
  menteeId: number;
  planId: number;
  registrationId: number;
}

export interface CreateMeetingData {
  menteeId: number;
  mentorId: number;
  slotStartTime: string; // ISO 8601 datetime format
  slotEndTime: string; // ISO 8601 datetime format
}
