import { QueryClient } from "@tanstack/react-query";

let globalQueryClient: QueryClient | null = null;

export function setQueryClient(client: QueryClient) {
  globalQueryClient = client;
}

export function getQueryClient(): QueryClient {
  if (!globalQueryClient) {
    throw new Error(
      "QueryClient not initialized. Make sure to call setQueryClient first."
    );
  }
  return globalQueryClient;
}
