export * from "./auth.type";
export * from "./user.type";
export * from "./search.mentorbrowse.type";
export * from "./mentor.type";
export * from "./payment.type";

export interface pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
