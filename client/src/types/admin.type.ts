export type UserRole = "Mentee" | "Mentor" | "Admin";
export type UserStatus = "Active" | "Pending" | "Inactive" | "Banned";

// --- Pagination ---
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdminListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationInfo;
}

export interface AdminResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

// --- Mentee ---
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

// --- Mentor ---
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

// --- Invoice ---
export interface AdminInvoiceItem {
  invoice_id: string;
  method: string;
  paid_time: string;
  payment_status: string;
  currency: string;
  amount_subtotal: number;
  amount_total: number;
  stripe_receipt_url: string | null;
  plan_description: string;
  plan_type: string;
  plan_charge: number;
  // Mentee Info
  mentee_id: number;
  mentee_first_name: string;
  mentee_last_name: string;
  mentee_email: string;
  mentee_avatar_url: string | null;
  // Mentor Info
  mentor_id: number;
  mentor_first_name: string;
  mentor_last_name: string;
  mentor_email: string;
  mentor_avatar_url: string | null;
}

export interface InvoiceStatsData {
  year: number;
  month: number;
  total_amount: number;
  total_count: number;
  invoices: AdminInvoiceItem[];
  pagination: PaginationInfo;
}

// --- System Stats ---
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
