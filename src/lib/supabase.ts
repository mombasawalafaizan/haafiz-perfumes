import {
  IPaginationParams,
  ISupabaseQueryConfig,
  IQueryResult,
  TFilterValue,
  ISupabaseFilterConfig,
} from "@/types/query";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Generic Supabase query function with pagination, sorting, searching, and filtering
 */
export async function querySupabase<T = any>(
  tableName: string,
  uiParams: IPaginationParams,
  config: ISupabaseQueryConfig
): Promise<IQueryResult<T>> {
  // Extract parameters from UI params and config
  const page = uiParams.page || 1;
  const limit = uiParams.page_size || 10;
  const search = uiParams.search;
  const ordering = uiParams.ordering;

  // Parse ordering (format: "field" for asc, "-field" for desc)
  let sortBy: string | undefined;
  let sortOrder: "asc" | "desc" = "asc";
  if (ordering) {
    if (ordering.startsWith("-")) {
      sortBy = ordering.substring(1);
      sortOrder = "desc";
    } else {
      sortBy = ordering;
      sortOrder = "asc";
    }
  }

  // Extract filters from UI params (exclude pagination, search, ordering)
  const filters: Record<string, TFilterValue> = {};
  for (const [key, value] of Object.entries(uiParams)) {
    if (
      !["page", "page_size", "pagination", "ordering", "search"].includes(key)
    ) {
      filters[key] = value as TFilterValue;
    }
  }

  // Use config values
  const searchFields = config.searchFields || [];
  const sortingFields = config.sortingFields || [];
  const filterFields = config.filterFields || [];
  const select = config.select || "*";
  const count = config.count || "exact";

  // Build the base query
  let query = supabase.from(tableName).select(select, { count });

  // Apply filters
  if (Object.keys(filters).length > 0) {
    query = applyFilters(query, filters, filterFields);
  }

  // Apply search
  if (search && searchFields.length > 0) {
    query = applySearch(query, search, searchFields);
  }

  // Apply sorting
  if (sortBy) {
    query = applySorting(query, sortBy, sortOrder, sortingFields);
  }

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  // Execute query
  const { data, error, count: totalCount } = await query;

  // Calculate pagination info
  const totalPages = totalCount ? Math.ceil(totalCount / limit) : 0;
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    data: data as T[] | null,
    count: totalCount,
    error,
    pagination: {
      page,
      limit,
      totalPages,
      hasNext,
      hasPrev,
    },
  };
}

const dateSuffixes = new RegExp("(_gte|_lte|_lt|_gt)");
/**
 * Apply filters to the query
 */
function applyFilters(
  query: any,
  filters: Record<string, TFilterValue>,
  filterFields: ISupabaseFilterConfig[]
) {
  for (const [field, value] of Object.entries(filters)) {
    let filterKey = field;
    if (value === null || value === undefined || value === "") continue;

    // Remove _gte, _lte, _lt, _gt suffixes as this is a date type
    let isDate = false;
    if (dateSuffixes.test(field)) {
      filterKey = filterKey.replace(dateSuffixes, "");
      isDate = true;
    }

    const config = filterFields.find((f) => {
      if (isDate) {
        return (
          (f.field as string) + (f.operator ? `_${f.operator}` : "") === field
        );
      } else {
        return (f.field as string) === field;
      }
    });
    if (!config) continue; // Skip if field is not configured

    const operator = config?.operator || getDefaultOperator(config?.type);

    switch (config.type) {
      case "string":
        if (operator === "like" || operator === "ilike") {
          query = query[operator](config?.field, `%${value}%`);
        } else {
          query = query[operator](config?.field, value);
        }
        break;

      case "number":
        query = query[operator](config?.field, Number(value));
        break;

      case "boolean":
        query = query.eq(config?.field, Boolean(value));
        break;

      case "date":
        const dateValue = value;
        query = query[operator](config?.field, dateValue);
        break;

      case "enum":
        if (config.allowedValues && config.allowedValues.includes(value)) {
          query = query.eq(config?.field, value);
        }
        break;

      case "array":
        if (Array.isArray(value)) {
          if (operator === "contains") {
            query = query.contains(config?.field, value);
          } else if (operator === "overlaps") {
            query = query.overlaps(config?.field, value);
          } else {
            query = query.in(config?.field, value);
          }
        }
        break;

      default:
        query = query.eq(config?.field, value);
    }
  }

  return query;
}

/**
 * Apply search to multiple fields
 */
function applySearch(query: any, searchTerm: string, searchFields: string[]) {
  if (!searchTerm.trim()) return query;

  // Create OR conditions for search across multiple fields
  const searchConditions = searchFields
    .map((field) => `${field}.ilike.%${searchTerm}%`)
    .join(",");

  return query.or(searchConditions);
}

/**
 * Apply sorting with validation
 */
function applySorting(
  query: any,
  sortBy: string,
  sortOrder: "asc" | "desc",
  sortingFields: string[]
) {
  // Validate sorting field
  if (sortingFields.length > 0 && !sortingFields.includes(sortBy)) {
    console.warn(
      `Sorting field '${sortBy}' is not allowed. Allowed fields: ${sortingFields.join(
        ", "
      )}`
    );
    return query;
  }

  return query.order(sortBy, { ascending: sortOrder === "asc" });
}

/**
 * Get default operator based on field type
 */
function getDefaultOperator(type: ISupabaseFilterConfig["type"]): string {
  switch (type) {
    case "string":
      return "ilike";
    case "number":
    case "boolean":
    case "date":
    case "enum":
      return "eq";
    case "array":
      return "in";
    default:
      return "eq";
  }
}

// Usage examples:

/**
 * Example 1: Simple product listing with pagination and search
 */
// export async function getProducts(uiParams: IPaginationParams) {
//   const config: SupabaseQueryConfig = {
//     searchFields: ["name", "description", "brand"],
//     sortingFields: ["name", "price", "created_at"],
//     filterFields: {
//       category: {
//         type: "enum",
//         allowedValues: ["electronics", "clothing", "books"],
//       },
//       price: { type: "number", operator: "lte" },
//       in_stock: { type: "boolean" },
//       created_at: { type: "date" },
//     },
//   };

//   return querySupabase<Product>("products", uiParams, config);
// }

// /**
//  * Example 2: Admin orders with complex filtering
//  */
// export async function getOrders(uiParams: IPaginationParams) {
//   const config: SupabaseQueryConfig = {
//     select:
//       "*, customer:customers(name, email), order_items:order_items(*, product:products(name))",
//     searchFields: ["order_number", "customer.name", "customer.email"],
//     sortingFields: ["created_at", "total_amount", "status"],
//     filterFields: {
//       status: {
//         type: "enum",
//         allowedValues: [
//           "pending",
//           "processing",
//           "shipped",
//           "delivered",
//           "cancelled",
//         ],
//       },
//       total_amount: { type: "number", operator: "gte" },
//       created_at: { type: "date" },
//       payment_status: { type: "boolean" },
//       tags: { type: "array", operator: "contains" },
//     },
//   };

//   return querySupabase<Order>("orders", uiParams, config);
// }

// /**
//  * Example 3: Customer dashboard - user's orders
//  */
// export async function getUserOrders(userId: string, uiParams: IPaginationParams) {
//   // Add user_id to the UI params
//   const paramsWithUserId: IPaginationParams = {
//     ...uiParams,
//     user_id: userId,
//   };

//   const config: ISupabaseQueryConfig = {
//     searchFields: ["order_number"],
//     sortingFields: ["created_at", "total_amount"],
//     filterFields: {
//       user_id: { type: "string" },
//       status: {
//         type: "enum",
//         allowedValues: [
//           "pending",
//           "processing",
//           "shipped",
//           "delivered",
//           "cancelled",
//         ],
//       },
//       created_at: { type: "date" },
//     },
//   };

//   return querySupabase<Order>("orders", paramsWithUserId, config);
// }

/**
 * Type-safe helper for creating Supabase query configurations
 */
export function createQueryConfig(
  config: ISupabaseQueryConfig
): ISupabaseQueryConfig {
  return config;
}

/**
 * Higher-order function to create type-safe query functions
 */
export function createQueryFunction<T = any>(
  tableName: string,
  config: ISupabaseQueryConfig
) {
  return (uiParams: IPaginationParams) =>
    querySupabase<T>(tableName, uiParams, config);
}
