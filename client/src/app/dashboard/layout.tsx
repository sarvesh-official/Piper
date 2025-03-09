import { SidebarProvider } from "@/context/SidebarContext";
import DashboardLayout from "@/layout/DashboardLayout";
import React from "react";

export default function Layout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <SidebarProvider>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </SidebarProvider>
    </div>
  );
}
