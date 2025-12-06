import type { pagination } from ".";
export interface Skill {
  skill_id: number;
  skill_name: string;
}

export interface Company {
  company_id: number;
  company_name: string;
  job_title_id: number;
  job_name: string;
}

export interface Category {
  category_id: number;
  category_name: string;
}

export interface SocialLink {
  link: string;
  platform: string;
}

export interface Plan {
  plan_id: number;
  plan_description: string;
  plan_charge: number;
  plan_type: string;
  sessions_duration?: number;
  benefits?: string[];
}

export interface Feedback {
  mentee_id: number;
  mentee_first_name: number;
  mentee_last_name: number;
  stars: number;
  content: string;
  sent_time: string;
  plan_id: number;
  plan_type: string;
  plan_description: string;
  plan_charge: number;
}

export interface Mentor {
  user_id: number;
  first_name: string;
  last_name: string;
  avatar_url: string;
  country: string;
  bio: string;
  headline: string;
  response_time: string;
  total_feedbacks: number;
  average_rating: number | null;
  lowest_plan_price: number;
  skills: Skill[];
  languages: string[];
  companies: Company[];
  categories: Category[];
}

export interface MentorProfile {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  sex: string;
  avatar_url: string;
  country: string;
  timezone: string;
  bio: string;
  headline: string;
  response_time: string;
  cv_url: string;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  bank_branch: string;
  swift_code: string;
  social_links: SocialLink[];
  companies: Company[];
  skills: Skill[];
  languages: string[];
  plans: Plan[];
  total_mentees: number;
  total_feedbacks: number;
  total_stars: number;
  average_rating: number | null;
  feedbacks: Feedback[];
}

export interface MentorListResponse {
  success: boolean;
  message: string;
  data?: {
    mentors: Mentor[];
    pagination: pagination;
  };
}

export interface getMentorProfileResponse {
  success: boolean;
  message: string;
  data?: MentorProfile;
}
