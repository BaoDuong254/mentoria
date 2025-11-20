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
