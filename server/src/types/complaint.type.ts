export interface Complaint {
  complaint_id: number;
  meeting_id: number;
  mentee_id: number;
  mentor_id: number;
  content: string;
  status: "Pending" | "Reviewed" | "Resolved" | "Rejected";
  created_at: Date;
  updated_at: Date;
  admin_response: string | null;
}

export interface ComplaintResponse {
  complaint_id: number;
  meeting_id: number;
  mentee_id: number;
  mentor_id: number;
  content: string;
  status: "Pending" | "Reviewed" | "Resolved" | "Rejected";
  created_at: Date;
  updated_at: Date;
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
  meeting_date: Date;
  meeting_start_time: Date;
  meeting_end_time: Date;
}

export interface CreateComplaintRequest {
  meeting_id: number;
  content: string;
}

export interface UpdateComplaintStatusRequest {
  status: "Reviewed" | "Resolved" | "Rejected";
  admin_response?: string;
}

export interface ComplaintListResponse {
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
