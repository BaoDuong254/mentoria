export interface Complaint {
  complaint_id: number;
  meeting_id: number;
  mentee_id: number;
  mentor_id: number;
  content: string;
  status: "Pending" | "Reviewed" | "Resolved" | "Rejected";
  created_at: string;
  updated_at: string;
  admin_response: string | null;
}

export interface ComplaintResponse {
  complaint_id: number;
  meeting_id: number;
  mentee_id: number;
  mentor_id: number;
  content: string;
  status: "Pending" | "Reviewed" | "Resolved" | "Rejected";
  created_at: string;
  updated_at: string;
  admin_response: string | null;
  // Mentor info
  mentor_first_name: string;
  mentor_last_name: string;
  mentor_email: string;
  mentor_avatar_url: string | null;
  // Mentee info
  mentee_first_name: string;
  mentee_last_name: string;
  mentee_email: string;
  mentee_avatar_url: string | null;
  // Meeting info
  meeting_date: string;
  meeting_start_time: string;
  meeting_end_time: string;
}

export interface CreateComplaintRequest {
  meeting_id: number;
  content: string;
}

export interface GetComplaintsResponse {
  success: boolean;
  message: string;
  data: ComplaintResponse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CheckExpiredPendingResponse {
  success: boolean;
  isExpired: boolean;
  meetingInfo?: {
    mentor_id: number;
    start_time: string;
  };
}
