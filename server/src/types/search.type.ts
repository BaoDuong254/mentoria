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
