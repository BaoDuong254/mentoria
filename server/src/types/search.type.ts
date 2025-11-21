import { MentorListItem } from "./mentor.type";

export interface SearchMentorsQuery {
  keyword: string;
  page?: number;
  limit?: number;
}

export interface SearchMentorsResponse {
  success: boolean;
  message: string;
  data?: {
    mentors: MentorListItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    searchInfo: {
      keyword: string;
      searchedFields: string[];
    };
  };
}

export interface SkillCategoryItem {
  id: number;
  name: string;
  type: "skill" | "category";
  super_category_id: number | null;
  mentor_count: number;
}

export interface SearchSkillsQuery {
  keyword: string;
  page?: number;
  limit?: number;
}

export interface SearchSkillsResponse {
  success: boolean;
  message: string;
  data?: {
    results: SkillCategoryItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    searchInfo: {
      keyword: string;
    };
  };
}

export interface CompanyItem {
  id: number;
  name: string;
  mentor_count: number;
}

export interface SearchCompaniesQuery {
  keyword: string;
  page?: number;
  limit?: number;
}

export interface SearchCompaniesResponse {
  success: boolean;
  message: string;
  data?: {
    results: CompanyItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    searchInfo: {
      keyword: string;
    };
  };
}

export interface JobTitleItem {
  id: number;
  name: string;
  mentor_count: number;
}

export interface SearchJobTitlesQuery {
  keyword: string;
  page?: number;
  limit?: number;
}

export interface SearchJobTitlesResponse {
  success: boolean;
  message: string;
  data?: {
    results: JobTitleItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    searchInfo: {
      keyword: string;
    };
  };
}
