import { SidebarProvider } from "@/context/SidebarContext";
import React from "react";

export default function Layout({
  children
}: Readonly<{
  children: React.ReactNode;
}>){
  return (
    <div className="min-h-screen">
      <SidebarProvider>
      {children}
      </SidebarProvider>
    </div>
  );
}
