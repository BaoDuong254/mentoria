export interface MentorProfile {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  sex: string | null;
  avatar_url: string | null;
  country: string | null;
  timezone: string | null;
  bio: string | null;
  headline: string | null;
  response_time: string;
  cv_url: string | null;
  bank_name: string | null;
  account_number: string | null;
  account_holder_name: string | null;
  bank_branch: string | null;
  swift_code: string | null;
  social_links: Array<{
    link: string;
    platform: string;
  }>;
  companies: Array<{
    company_id: number;
    company_name: string;
    job_title_id: number;
    job_name: string;
  }>;
  skills: Array<{
    skill_id: number;
    skill_name: string;
  }>;
  languages: string[];
  plans: Array<{
    plan_id: number;
    plan_description: string;
    plan_charge: number;
    plan_type: string;
    // For plan_sessions type
    sessions_duration?: number;
    // For plan_mentorships type
    benefits?: string[];
  }>;
  // Stats (calculated from utility functions)
  total_mentees: number;
  total_feedbacks: number;
  total_stars: number;
  average_rating: number | null;
  // Feedbacks from mentees
  feedbacks: Array<{
    mentee_id: number;
    mentee_first_name: string;
    mentee_last_name: string;
    stars: number;
    content: string;
    sent_time: Date;
    plan_id: number | null;
    plan_type: string | null;
    plan_description: string | null;
    plan_charge: number | null;
  }>;
}

export interface UpdateMentorProfileRequest {
  firstName?: string;
  lastName?: string;
  sex?: string;
  country?: string;
  timezone?: string;
  bio?: string;
  headline?: string;
  responseTime?: string;
  cvUrl?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  bankBranch?: string;
  swiftCode?: string;
  socialLinks?: Array<{
    link: string;
    platform: string;
  }>;
  companies?: Array<{
    companyName: string;
    jobTitleName: string;
  }>;
  languages?: string[];
  skillIds?: number[];
}

export interface MentorListItem {
  user_id: number;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  country: string | null;
  bio: string | null;
  headline: string | null;
  response_time: string;
  total_feedbacks: number;
  average_rating: number | null;
  lowest_plan_price: number | null;
  skills: Array<{
    skill_id: number;
    skill_name: string;
  }>;
  languages: string[];
  companies: Array<{
    company_id: number;
    company_name: string;
    job_title_id: number;
    job_name: string;
  }>;
  categories: Array<{
    category_id: number;
    category_name: string;
  }>;
}

export interface GetMentorsQuery {
  page?: number;
  limit?: number;
}

export interface MentorStatsResponse {
  total_mentees: number;
  total_feedbacks: number;
  total_stars: number;
  average_rating: number | null;
}

export interface FilterMentorsQuery extends GetMentorsQuery {
  firstName?: string;
  lastName?: string;
  searchName?: string;
  skillIds?: number[];
  companyIds?: number[];
  jobTitleIds?: number[];
  categoryName?: string;
  countries?: string[];
  languages?: string[];
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortColumn?: string;
  sortDirection?: "ASC" | "DESC";
}

// Nếu muốn, có thể thêm type response:
export interface FilterMentorsResponse {
  success: boolean;
  message: string;
  data: {
    mentors: MentorListItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

// Plan-related types
export interface PlanSession {
  plan_id: number;
  plan_description: string;
  plan_charge: number;
  plan_type: string;
  mentor_id: number;
  sessions_duration: number;
  plan_category: "session";
}

export interface PlanMentorship {
  plan_id: number;
  plan_description: string;
  plan_charge: number;
  plan_type: string;
  mentor_id: number;
  calls_per_month: number;
  minutes_per_call: number;
  benefits: string[];
  plan_category: "mentorship";
}

export type Plan = PlanSession | PlanMentorship;

export interface CreatePlanSessionRequest {
  planDescription: string;
  planCharge: number;
  planType: string;
  sessionsDuration: number;
}

export interface CreatePlanMentorshipRequest {
  planDescription: string;
  planCharge: number;
  planType: string;
  callsPerMonth: number;
  minutesPerCall: number;
  benefits: string[];
}

export interface UpdatePlanSessionRequest {
  planDescription?: string;
  planCharge?: number;
  planType?: string;
  sessionsDuration?: number;
}

export interface UpdatePlanMentorshipRequest {
  planDescription?: string;
  planCharge?: number;
  planType?: string;
  callsPerMonth?: number;
  minutesPerCall?: number;
  benefits?: string[];
}
