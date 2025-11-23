export interface SearchMentorState {
  //------------------SKILLS-------------------------
  //state
  skills: resultsSkills[];
  selectedSkills: resultsSkills[];
  keywordSkills: string;
  isLoading: boolean;
  //actions
  searchSkills: (keyword: string, limit: number) => Promise<void>;
  toggleSkill: (skill: resultsSkills) => void;
  resetSkillSearch: () => void;

  //------------------JOB TITLES-------------------------
  //state
  jobTitles: resultsJobTitles[];
  selectedJobTitles: resultsJobTitles[];
  keywordJobTitles: string;

  //actions
  searchJobTitles: (keyword: string, limit: number) => Promise<void>;
  toggleJobTitle: (jobTitle: resultsJobTitles) => void;
  resetJobSearch: () => void;

  //-------------------COMPANIES-------------------------
  //state
  companies: resultsCompanies[];
  selectedCompanies: resultsCompanies[];
  keywordCompanies: string;

  //actions
  searchCompanies: (keyword: string, limit: number) => Promise<void>;
  toggleCompany: (company: resultsCompanies) => void;
  resetCompanySearch: () => void;
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

export interface resultsJobTitles {
  id: number;
  name: string;
  mentor_count: number;
}

export interface resultsCompanies {
  id: number;
  name: string;
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

export interface searchJobTitlesResponse {
  success: boolean;
  message: string;
  data?: {
    results?: resultsJobTitles[];
    pagination?: pagination;
    searchInfo?: searchInfo;
  };
  error?: error[];
}

export interface searchCompaniesResponse {
  success: boolean;
  message: string;
  data?: {
    results?: resultsCompanies[];
    pagination?: pagination;
    searchInfo?: searchInfo;
  };
  error?: error[];
}
