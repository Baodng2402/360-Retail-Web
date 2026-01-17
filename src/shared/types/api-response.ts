/**
 * Standard API Response Format
 * Tất cả API đều trả về format này
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: string[] | null;
}

/**
 * Helper type for successful response
 */
export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
  errors: null;
};

/**
 * Helper type for error response
 */
export type ApiErrorResponse = {
  success: false;
  message: string;
  data: null;
  errors: string[];
};
