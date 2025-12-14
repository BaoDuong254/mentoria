import type { MentorProfile, pagination } from ".";
import type { Mentor } from ".";
export interface SearchMentorState {
  //------------------SKILLS-------------------------
  //state
  skills: resultsSkills[];
  selectedSkills: resultsSkills[];
  keywordSkills: string;
  isLoading: boolean;
  defaultSkills: resultsSkills[];
  //actions
  searchSkills: (keyword: string, limit: number) => Promise<void>;
  toggleSkill: (skill: resultsSkills) => void;
  resetSkillSearch: () => void;

  //------------------JOB TITLES-------------------------
  //state
  jobTitles: resultsJobTitles[];
  selectedJobTitles: resultsJobTitles[];
  keywordJobTitles: string;
  defaultJobTitles: resultsJobTitles[];

  //actions
  searchJobTitles: (keyword: string, limit: number) => Promise<void>;
  toggleJobTitle: (jobTitle: resultsJobTitles) => void;
  resetJobSearch: () => void;

  //-------------------COMPANIES-------------------------
  //state
  companies: resultsCompanies[];
  selectedCompanies: resultsCompanies[];
  keywordCompanies: string;
  defaultCompanies: resultsCompanies[];

  //actions
  searchCompanies: (keyword: string, limit: number) => Promise<void>;
  toggleCompany: (company: resultsCompanies) => void;
  resetCompanySearch: () => void;

  //-------------------FETCH ALL MENTORS-------------------------
  mentors: Mentor[];
  pageMentor: pagination | null;
  isFetchingMentors: boolean;

  //actions
  fetchMentors: (page?: number, limit?: number) => Promise<void>;

  //-------------------FETCH MENTOR PROFILE------------------------
  selectedMentor: MentorProfile | null;
  isLoadingProfile: boolean;

  //actions
  fetchMentorById: (id: number | string) => Promise<void>;

  fetchInitialFilterData: () => Promise<void>;
  fetchAvailableFilters: () => Promise<void>;

  //-------------------ADDITIONAL FILTERS------------------------
  searchKeyword: string;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  minRating: number | undefined;
  selectedCountries: string[];
  selectedLanguages: string[];
  status: string | undefined;
  experienceLevel: string | undefined;
  availability: string | undefined;
  sortColumn: string;
  sortDirection: "ASC" | "DESC";

  availableCountries: string[];
  availableLanguages: string[];
  isLoadingFilters: boolean;

  //actions
  setPriceRange: (min: number | undefined, max: number | undefined) => void;
  setMinRating: (rating: number | undefined) => void;
  setSorting: (column: string, direction: "ASC" | "DESC") => void;
  setSearchKeyword: (keyword: string) => void;
  setSelectedCountries: (countries: string[]) => void;
  setSelectedLanguages: (languages: string[]) => void;
  setStatus: (status: string | undefined) => void;
  setExperienceLevel: (level: string | undefined) => void;
  setAvailability: (availability: string | undefined) => void;
  resetAllFilters: () => void;
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

export interface getSkillsListResponse {
  success: boolean;
  message: string;
  errors?: error[];
  data?: {
    skills: resultsSkills[];
    pagination: pagination;
  };
}

export interface getCompaniesListResponse {
  success: boolean;
  message: string;
  error?: error[];
  data?: {
    companies: resultsCompanies[];
    pagination: pagination;
  };
}

export interface getJobTitlesListResponse {
  success: boolean;
  message: string;
  error?: error[];
  data?: {
    jobTitles: resultsJobTitles[];
    pagination: pagination;
  };
}

export interface mappedSkills {
  skill_id: number;
  skill_name: string;
  mentor_count: number;
}
