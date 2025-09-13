import { AdminNavbar } from "@/components/admin/admin-navbar";

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
