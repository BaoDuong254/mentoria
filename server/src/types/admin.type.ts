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
  status?: "Active" | "Inactive" | "Banned" | "Pending" | undefined;
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
  bank_name: string | null;
  account_number: string | null;
  account_holder_name: string | null;
  bank_branch: string | null;
  swift_code: string | null;
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
  bank_name?: string | undefined;
  account_number?: string | undefined;
  account_holder_name?: string | undefined;
  bank_branch?: string | undefined;
  swift_code?: string | undefined;
  status?: "Active" | "Inactive" | "Banned" | "Pending" | undefined;
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

export type DashboardGroupBy = "mentor" | "month" | "category";
export type DashboardSortBy =
  | "total_revenue"
  | "total_bookings"
  | "average_rating"
  | "completed_meetings"
  | "mentor_name"
  | "average_invoice_amount";
export type DashboardSortOrder = "ASC" | "DESC";

export interface DashboardStatsParams {
  groupBy?: DashboardGroupBy;
  startDate?: string;
  endDate?: string;
  companyId?: number;
  categoryId?: number;
  minRevenue?: number;
  minBookingCount?: number;
  sortBy?: DashboardSortBy;
  sortOrder?: DashboardSortOrder;
}

// Mentor Statistics (GroupBy = 'mentor')
export interface MentorDashboardStats {
  mentor_id: number;
  mentor_name: string;
  mentor_email: string;
  mentor_avatar_url: string | null;
  mentor_country: string | null;
  mentor_status: string;
  mentor_headline: string | null;
  company_names: string;
  job_titles: string;
  skills: string;
  total_bookings: number;
  total_invoices: number;
  total_revenue: number;
  average_invoice_amount: number;
  completed_meetings: number;
  cancelled_meetings: number;
  upcoming_meetings: number;
  average_rating: number;
  total_reviews: number;
  total_plans: number;
}

// Monthly Statistics (GroupBy = 'month')
export interface MonthlyDashboardStats {
  year: number;
  month: number;
  month_name: string;
  total_invoices: number;
  total_mentees: number;
  total_mentors: number;
  total_revenue: number;
  average_invoice_amount: number;
  total_bookings: number;
}

// Category Statistics (GroupBy = 'category')
export interface CategoryDashboardStats {
  category_id: number;
  category_name: string;
  total_mentors_with_skill: number;
  total_bookings: number;
  total_revenue: number;
}

export interface DashboardStatsResponse {
  success: boolean;
  message: string;
  data: {
    groupBy: DashboardGroupBy;
    mentorStats?: MentorDashboardStats[];
    monthlyStats?: MonthlyDashboardStats[];
    categoryStats?: CategoryDashboardStats[];
  };
}
