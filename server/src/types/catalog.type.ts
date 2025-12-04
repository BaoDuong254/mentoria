export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Reusable base interfaces
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data?: T & { pagination: PaginationInfo };
}

// Super categories
export type SuperCategoriesQuery = PaginationQuery;

export interface SuperCategoryItem {
  category_id: number;
  category_name: string;
  mentor_count: number;
}

export type SuperCategoriesResponse = BaseResponse<{ categories: SuperCategoryItem[] }>;

// Skills
export type SkillsQuery = PaginationQuery;

export interface SkillCategoryInfo {
  category_id: number;
  category_name: string;
  super_category_id: number | null;
  super_category_name: string | null;
}

export interface SkillItem {
  skill_id: number;
  skill_name: string;
  mentor_count: number;
  categories: SkillCategoryInfo[];
}

export type SkillsResponse = BaseResponse<{ skills: SkillItem[] }>;

// Companies
export type CompaniesQuery = PaginationQuery;

export interface CompanyItem {
  company_id: number;
  company_name: string;
  mentor_count: number;
}

export type CompaniesResponse = BaseResponse<{ companies: CompanyItem[] }>;

// Job Titles
export type JobTitlesQuery = PaginationQuery;

export interface JobTitleItem {
  job_title_id: number;
  job_title_name: string;
  mentor_count: number;
}

export type JobTitlesResponse = BaseResponse<{ jobTitles: JobTitleItem[] }>;

// Countries
export type CountriesQuery = PaginationQuery;

export interface CountryItem {
  country: string;
  mentor_count: number;
}

export type CountriesResponse = BaseResponse<{ countries: CountryItem[] }>;

// Languages
export type LanguagesQuery = PaginationQuery;

export interface LanguageItem {
  language: string;
  mentor_count: number;
}

export type LanguagesResponse = BaseResponse<{ languages: LanguageItem[] }>;
