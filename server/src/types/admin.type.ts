// Admin Mentee Types
export interface AdminMenteeItem {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  goal: string | null;
}

export interface UpdateAdminMenteeRequest {
  first_name?: string | undefined;
  last_name?: string | undefined;
  email?: string | undefined;
  goal?: string | undefined;
}

// Admin Mentor Types
export interface AdminMentorItem {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  role: string;
  bio: string | null;
  cv_url: string | null;
  headline: string | null;
  response_time: string;
  created_at?: string;
}

export interface UpdateAdminMentorRequest {
  first_name?: string | undefined;
  last_name?: string | undefined;
  email?: string | undefined;
  bio?: string | undefined;
  headline?: string | undefined;
  response_time?: string | undefined;
  cv_url?: string | undefined;
}

// Review Mentor Types
export type ReviewAction = "accept" | "reject";

export interface ReviewMentorRequest {
  action: ReviewAction;
}

// Pagination Types
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// System Statistics Types
export interface SystemStats {
  users: {
    total: number;
    mentors: number;
    mentees: number;
    admins: number;
  };
  mentors: {
    active: number;
    pending: number;
    inactive: number;
    banned: number;
  };
  mentees: {
    active: number;
    inactive: number;
    banned: number;
  };
  bookings: {
    total: number;
    thisMonth: number;
    lastMonth: number;
  };
  invoices: {
    total: number;
    totalRevenue: number;
    thisMonthRevenue: number;
    lastMonthRevenue: number;
    averageInvoiceAmount: number;
  };
  plans: {
    totalPlans: number;
    sessionPlans: number;
    mentorshipPlans: number;
  };
  meetings: {
    total: number;
    completed: number;
    upcoming: number;
    cancelled: number;
  };
}

// Service Response Types
export interface AdminServiceResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AdminListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination?: PaginationInfo;
}
