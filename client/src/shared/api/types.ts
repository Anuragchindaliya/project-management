/**
 * API-specific types and utilities
 */

import type { ApiResponse } from './client';

// Helper type to extract data from ApiResponse
export type ApiData<T> = T extends ApiResponse<infer D> ? D : never;

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
