export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Super categories query (pagination only, no keyword search)
export interface SuperCategoriesQuery {
  page?: number;
  limit?: number;
}

export interface SuperCategoryItem {
  category_id: number;
  category_name: string;
  mentor_count: number;
}

export interface SuperCategoriesResponse {
  success: boolean;
  message: string;
  data?: {
    categories: SuperCategoryItem[];
    pagination: PaginationInfo;
  };
}

// Skills query (pagination only, no keyword search)
export interface SkillsQuery {
  page?: number;
  limit?: number;
}

export interface SkillItem {
  skill_id: number;
  skill_name: string;
  mentor_count: number;
  category_id: number | null;
  category_name: string | null;
  super_category_id: number | null;
  super_category_name: string | null;
}

export interface SkillsResponse {
  success: boolean;
  message: string;
  data?: {
    skills: SkillItem[];
    pagination: PaginationInfo;
  };
}

// Companies query (pagination only, no keyword search)
export interface CompaniesQuery {
  page?: number;
  limit?: number;
}

export interface CompanyItem {
  company_id: number;
  company_name: string;
  mentor_count: number;
}

export interface CompaniesResponse {
  success: boolean;
  message: string;
  data?: {
    companies: CompanyItem[];
    pagination: PaginationInfo;
  };
}

// Job Titles query (pagination only, no keyword search)
export interface JobTitlesQuery {
  page?: number;
  limit?: number;
}

export interface JobTitleItem {
  job_title_id: number;
  job_title_name: string;
  mentor_count: number;
}

export interface JobTitlesResponse {
  success: boolean;
  message: string;
  data?: {
    jobTitles: JobTitleItem[];
    pagination: PaginationInfo;
  };
}
