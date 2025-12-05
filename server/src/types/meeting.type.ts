export interface Meeting {
  meeting_id: number;
  invoice_id: number;
  plan_registerations_id: number;
  status: "Pending" | "Scheduled" | "Completed" | "Cancelled";
  location: string;
  start_time: Date;
  end_time: Date;
  date: Date;
  mentor_id: number;
}

export interface MeetingResponse {
  meeting_id: number;
  invoice_id: number;
  plan_registerations_id: number;
  status: "Pending" | "Scheduled" | "Completed" | "Cancelled";
  location: string;
  start_time: Date;
  end_time: Date;
  date: Date;
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
}

export interface UpdateMeetingLocationRequest {
  meetingId: number;
  location: string;
}

export interface UpdateMeetingStatusRequest {
  meetingId: number;
  status: "Scheduled" | "Completed" | "Cancelled";
}

export interface MeetingListResponse {
  success: boolean;
  message: string;
  data: MeetingResponse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
