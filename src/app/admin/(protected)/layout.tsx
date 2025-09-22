"use client";
import { AdminNavbar } from "@/components/admin/admin-navbar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/admin/theme-provider";
import { setQueryClient } from "@/lib/query-client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

// Initialize the global QueryClient
setQueryClient(queryClient);

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
      >
        <div className="min-h-screen bg-background">
          <AdminNavbar />
          <main className="container mx-auto px-4 py-8">{children}</main>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
