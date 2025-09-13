import {
  format,
  subDays,
  subMonths,
  subYears,
  startOfDay,
  endOfDay,
} from "date-fns";
import { SortingState } from "@tanstack/react-table";
/**
 * Converts filter state to API parameters with automatic handling of date range suffixes
 * @param filters - The filter state object
 * @param filterConfigs - The filter configurations
 * @param dateFormat - Optional date format for date fields (default: "yyyy-MM-dd")
 * @returns API parameters object
 */
export const convertFiltersToApiParams = (
  filters: IFilterState,
  filterConfigs: IFilterConfig[],
  dateFormat: string = "yyyy-MM-dd"
): Record<string, any> => {
  const apiFilters: Record<string, any> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      // Find the filter config for this key
      const filterConfig = filterConfigs.find((config) => config.id === key);

      if (!filterConfig) {
        // If no config found, use the key as is
        apiFilters[key] = value;
        return;
      }

      // Handle different filter types
      switch (filterConfig.type) {
        case "dateRange":
        case "dateRangeWithOptions":
          // Automatically append _gte and _lte suffixes for date ranges
          if ((value as any)?.from) {
            const fromDate = new Date((value as any).from);
            apiFilters[`${filterConfig.field}_gte`] = format(
              fromDate,
              dateFormat
            );
          }
          if ((value as any)?.to) {
            const toDate = new Date((value as any).to);
            apiFilters[`${filterConfig.field}_lte`] = format(
              toDate,
              dateFormat
            );
          }
          break;

        case "number":
          // Handle number range filters (min/max)
          if (
            filterConfig.min !== undefined &&
            filterConfig.max !== undefined
          ) {
            if (
              (value as any)?.min !== null &&
              (value as any)?.min !== undefined
            ) {
              apiFilters[`${filterConfig.field}_gte`] = (value as any).min;
            }
            if (
              (value as any)?.max !== null &&
              (value as any)?.max !== undefined
            ) {
              apiFilters[`${filterConfig.field}_lte`] = (value as any).max;
            }
          } else {
            // Single number value
            apiFilters[filterConfig.field] = value;
          }
          break;

        default:
          // For all other filter types, use the field name as is
          apiFilters[filterConfig.field] = value;
          break;
      }
    }
  });

  return apiFilters;
};

/**
 * Gets a value from an object using a dot-notation path
 * @param obj - The object to get the value from
 * @param path - The path to the value (e.g. "address.city")
 * @returns The value at the path, or undefined if not found
 */
export const getNestedValue = (obj: any, path: string): any => {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
};

// Utility functions for date range calculations
export const getDateRangeFromOption = (option: string) => {
  const now = new Date();

  switch (option) {
    case "last7days":
      return {
        from: startOfDay(subDays(now, 7)),
        to: endOfDay(now),
      };
    case "last3months":
      return {
        from: startOfDay(subMonths(now, 3)),
        to: endOfDay(now),
      };
    case "last6months":
      return {
        from: startOfDay(subMonths(now, 6)),
        to: endOfDay(now),
      };
    case "lastYear":
      return {
        from: startOfDay(subYears(now, 1)),
        to: endOfDay(now),
      };
    case "today":
      return {
        from: startOfDay(now),
        to: endOfDay(now),
      };
    case "this_week":
      // Get start of current week (Monday)
      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      startOfWeek.setDate(diff);
      return {
        from: startOfDay(startOfWeek),
        to: endOfDay(now),
      };
    case "this_month":
      // Get start of current month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        from: startOfDay(startOfMonth),
        to: endOfDay(now),
      };
    case "this_year":
      // Get start of current year
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return {
        from: startOfDay(startOfYear),
        to: endOfDay(now),
      };
    case "custom":
      return {
        from: startOfDay(now),
        to: endOfDay(now),
      };
    default:
      return null;
  }
};

export const getColumnOrdering = (sorting: SortingState) => {
  const { id, desc } = sorting?.[0] ?? {};
  return id ? (desc ? `-${id}` : id) : undefined;
};

// Predefined date range options
export const DATE_RANGE_OPTIONS = [
  { label: "Last 7 days", value: "last7days" },
  { label: "Last 3 months", value: "last3months" },
  { label: "Last 6 months", value: "last6months" },
  { label: "Last year", value: "lastYear" },
  { label: "Today", value: "today" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "This Year", value: "this_year" },
  { label: "Custom", value: "custom" },
];
