export interface IPaginationParams {
  // Pagination
  page?: number;
  page_size?: number;
  pagination?: boolean;

  // Sorting (format: "field" for asc, "-field" for desc)
  ordering?: string;

  // Searching
  search?: string;

  // Dynamic filters (any key-value pairs from client)
  [key: string]: string | number | boolean | undefined;
}

// Supabase-specific configuration
export interface ISupabaseQueryConfig<T = any> {
  // Field configurations
  searchFields?: string[]; // Fields to search in
  sortingFields?: string[]; // Allowed fields for sorting
  filterFields?: ISupabaseFilterConfig<T>[]; // Filter field configurations

  // Supabase options
  select?: string;
  count?: "exact" | "planned" | "estimated";
}

// Filter configuration for each field
export interface ISupabaseFilterConfig<T = any> {
  field: keyof T;
  type: "string" | "number" | "boolean" | "date" | "enum" | "array";
  operator?:
    | "eq"
    | "neq"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "like"
    | "ilike"
    | "in"
    | "contains"
    | "overlaps";
  allowedValues?: any[]; // For enum type
}

export type TFilterValue = string | number | boolean | null;

export interface IQueryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface IPaginatedQueryResult<T> {
  data: T[] | null;
  count: number | null;
  error: any;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface IPaginatedQueryResult<T> {
  data: T[] | null;
  count: number | null;
  error: any;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
