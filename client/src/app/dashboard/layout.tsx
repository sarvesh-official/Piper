import { SidebarProvider } from "@/context/SidebarContext";
import DashboardLayout from "@/layout/DashboardLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Piper Ai",
  description:
    "Piper is an AI-powered knowledge assistant that helps users chat with documents, extract insights, and generate structured learning paths.",
};

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
