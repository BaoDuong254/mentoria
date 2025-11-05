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
  response_time: number | null;
  total_reviews: number;
  total_stars: number;
  total_mentee: number;
  cv_url: string | null;
  social_links: Array<{
    link: string;
    platform: string;
  }>;
  companies: Array<{
    company_id: number;
    company_name: string;
    role: string | null;
  }>;
  fields: Array<{
    field_id: number;
    field_name: string;
  }>;
  languages: string[];
  plans: Array<{
    plan_id: number;
    charge: number;
    duration: number;
    benefits: string[];
  }>;
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
  responseTime?: number;
  cvUrl?: string;
  socialLinks?: Array<{
    link: string;
    platform: string;
  }>;
  companies?: Array<{
    companyName: string;
    role?: string;
  }>;
  languages?: string[];
  fieldIds?: number[];
}
