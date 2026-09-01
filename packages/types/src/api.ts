export interface ApiErrorBody {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

export type ApiResult<T> =
  { success: true; data: T } | { success: false; error: ApiErrorBody };

/**
 * One page of a list endpoint. Offset-based because every list we page today
 * (library, teachers) is also searchable and wants an honest total for its
 * "showing X of Y" footer — a cursor can't give that.
 */
export interface Paginated<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
