export interface PaginationQuery {
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export function buildPaginatedResult<T>(
  items: T[],
  total: number,
  limit: number,
  offset: number,
): PaginatedResult<T> {
  return {
    items,
    total,
    limit,
    offset,
    hasMore: offset + items.length < total,
  };
}
