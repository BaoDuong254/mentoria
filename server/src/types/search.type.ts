import { MentorListItem } from "./mentor.type";

// Base types for all search queries
export interface BaseSearchQuery {
  keyword: string;
  page?: number;
  limit?: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface BaseSearchInfo {
  keyword: string;
  keywords: string[]; // Array of individual keywords
}

export interface BaseSearchResponse<T> {
  success: boolean;
  message: string;
  data?: {
    results: T[];
    pagination: PaginationInfo;
    searchInfo: BaseSearchInfo;
  };
}

// Specific query types (extending base)
export type SearchMentorsQuery = BaseSearchQuery;
export type SearchSkillsQuery = BaseSearchQuery;
export type SearchCompaniesQuery = BaseSearchQuery;
export type SearchJobTitlesQuery = BaseSearchQuery;

// Result item types
export interface SkillCategoryItem {
  skill_id: number;
  name: string;
  type: "skill" | "category";
  super_category_id: number | null;
  mentor_count: number;
}

export interface CompanyItem {
  id: number;
  name: string;
  mentor_count: number;
}

export interface JobTitleItem {
  id: number;
  name: string;
  mentor_count: number;
}

// Specific response types
export interface SearchMentorsResponse {
  success: boolean;
  message: string;
  data?: {
    mentors: MentorListItem[];
    pagination: PaginationInfo;
    searchInfo: BaseSearchInfo & {
      searchedFields: string[];
    };
  };
}

export type SearchSkillsResponse = BaseSearchResponse<SkillCategoryItem>;
export type SearchCompaniesResponse = BaseSearchResponse<CompanyItem>;
export type SearchJobTitlesResponse = BaseSearchResponse<JobTitleItem>;
