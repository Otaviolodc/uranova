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

      <div className="flex-1">
        {children}
      </div>

    </div>

  );

}