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
