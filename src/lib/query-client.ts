import { QueryClient } from "@tanstack/react-query";

let globalAdminQueryClient: QueryClient | null = null;

export function setAdminQueryClient(client: QueryClient) {
  globalAdminQueryClient = client;
}

export function getAdminQueryClient(): QueryClient {
  if (!globalAdminQueryClient) {
    throw new Error(
      "QueryClient not initialized. Make sure to call setQueryClient first."
    );
  }
  return globalAdminQueryClient;
}
