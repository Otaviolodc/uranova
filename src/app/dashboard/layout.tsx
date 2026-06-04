import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex bg-black min-h-screen">
      <Sidebar />

      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}