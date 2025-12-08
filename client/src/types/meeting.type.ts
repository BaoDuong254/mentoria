export interface Meeting {
  meeting_id: number;
  invoice_id: number;
  plan_registerations_id: number;
  status: "Pending" | "Scheduled" | "Completed" | "Cancelled";
  location: string | null;
  review_link: string | null;
  start_time: string;
  end_time: string;
  date: string;
  mentor_id: number;
}

export interface MeetingResponse {
  meeting_id: number;
  invoice_id: number;
  plan_registerations_id: number;
  status: "Pending" | "Scheduled" | "Completed" | "Cancelled";
  location: string | null;
  review_link: string | null;
  start_time: string;
  end_time: string;
  date: string;
  mentor_id: number;
  mentor_first_name: string;
  mentor_last_name: string;
  mentor_avatar_url: string | null;
  mentor_email: string;
  mentee_id: number;
  mentee_first_name: string;
  mentee_last_name: string;
  mentee_avatar_url: string | null;
  mentee_email: string;
  plan_type: string;
  plan_description: string;
  plan_charge: number;
  amount_paid: number;
  discuss_message?: string | null; // Content mentee wants to discuss
}

export interface GetMeetingsResponse {
  success: boolean;
  data: MeetingResponse[];
}

export interface UpdateMeetingLocationRequest {
  location: string;
}

export interface UpdateMeetingStatusRequest {
  status: "Scheduled" | "Completed" | "Cancelled";
}

export interface UpdateReviewLinkRequest {
  reviewLink: string;
}
