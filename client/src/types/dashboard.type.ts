// Session status types for Mentee Dashboard
export type SessionStatus = "accepted" | "payment_required" | "pending" | "completed" | "cancelled" | "out_of_date";

// Mentor session interface representing a booked session
export interface MentorSession {
  id: string;
  registrationId: number;
  planId: number;
  mentorId: number;
  menteeId: number;
  mentorName: string;
  mentorAvatar: string;
  mentorSpecialty: string;
  topic: string;
  planCharge: number;
  planDescription: string;
  scheduledDate: string;
  scheduledTime: string;
  status: SessionStatus;
  meetingLink?: string;
  invoiceId?: number;
  amount?: number;
  slotStartTime?: string;
  slotEndTime?: string;
  reviewLink?: string;
}

// Sessions grouped by date
export type SessionsByDate = Record<string, MentorSession[]>;

// Month configuration for calendar
export interface MonthConfig {
  month: number; // 1-12
  year: number;
}

// API Response types
export interface MenteeSessionsResponse {
  success: boolean;
  message: string;
  data?: {
    sessions: ApiSession[];
  };
}

export interface ApiSession {
  mentee_id: number;
  plan_registerations_id: number;
  plan_id: number;
  topic: string;
  plan_description: string;
  plan_charge: number;
  plan_type: string;
  mentor_id: number;
  mentor_first_name: string;
  mentor_last_name: string;
  mentor_avatar: string | null;
  mentor_specialty: string | null;
  meeting_status: string | null;
  meeting_link: string | null;
  start_time: string | null;
  end_time: string | null;
  date: string | null;
  invoice_id: number | null;
  amount: number | null;
  paid_time: string | null;
  review_link: string | null;
}

// Status metadata for styling
export interface StatusMeta {
  label: string;
  badgeClass: string;
  accentClass: string;
}

export const STATUS_META: Record<SessionStatus, StatusMeta> = {
  accepted: {
    label: "Confirmed",
    badgeClass: "bg-green-600 text-green-100",
    accentClass: "bg-green-400",
  },
  payment_required: {
    label: "Payment",
    badgeClass: "bg-yellow-600 text-yellow-100",
    accentClass: "bg-yellow-400",
  },
  pending: {
    label: "Pending",
    badgeClass: "bg-indigo-500 text-yellow-100",
    accentClass: "bg-indigo-400",
  },
  completed: {
    label: "Completed",
    badgeClass: "bg-slate-600 text-slate-100",
    accentClass: "bg-slate-400",
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-rose-600 text-rose-100",
    accentClass: "bg-rose-500",
  },
  out_of_date: {
    label: "Out of Date",
    badgeClass: "bg-red-700 text-red-100",
    accentClass: "bg-red-600",
  },
};

export const STATUS_ORDER: SessionStatus[] = [
  "accepted",
  "payment_required",
  "pending",
  "completed",
  "cancelled",
  "out_of_date",
];

export const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
