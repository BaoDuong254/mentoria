export interface SearchMentorState {
  //state
  skills: resultsSkills[];
  isLoading: boolean;
  //actions
  searchSkills: (keyword: string, limit: number) => Promise<void>;
}

export interface pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface searchInfo {
  keyword: string;
}

export interface resultsSkills {
  id: number;
  name: string;
  type: string;
  super_category_id: number | null;
  mentor_count: number;
}

export interface error {
  expected?: string;
  code: string;
  path: string[];
  message: string;
}

export interface searchSkillsResponse {
  success: boolean;
  message: string;
  data?: {
    results?: resultsSkills[];
    pagination?: pagination;
    searchInfo?: searchInfo;
  };
  error?: error[];
}
