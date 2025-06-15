import { Suspense } from "react";
import { Sidebar } from "./components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div>Loading...</div>}>
        <Sidebar />
      </Suspense>
      <div className="pl-64">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
