export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number; // 0-indexed
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}
