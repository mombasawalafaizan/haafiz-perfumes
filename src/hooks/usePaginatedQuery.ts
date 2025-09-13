import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { IPaginationParams, IQueryResult } from "@/types/query";

// Paginated query hook
const usePaginatedQuery = <T = any, E = any>(
  queryKey: (string | number | object)[],
  actionFn: (pagination: IPaginationParams) => Promise<IQueryResult<T>>,
  pagination: IPaginationParams = {},
  options?: Omit<UseQueryOptions<IQueryResult<T>, E>, "queryKey" | "queryFn">
) => {
  return useQuery<IQueryResult<T>, E>({
    queryKey: [...queryKey, pagination],
    queryFn: async () => {
      const response = await actionFn(pagination);
      if (response.error) throw response.error;
      return response;
    },
    // keepPreviousData: true, // Check in react-query docs about Keep previous data while loading new page
    ...options,
  });
};

export default usePaginatedQuery;
