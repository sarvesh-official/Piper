import type { Metadata } from "next";
import { Fira_Code } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/provider/ThemeProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { SidebarProvider } from "@/context/SidebarContext";
import { ToastContainer } from 'react-toastify';


const inter = Fira_Code({ subsets: ["cyrillic"] });

export const metadata: Metadata = {
  title: "Piper - AI Knowledge Assistant",
  description:
    "Piper is an AI-powered knowledge assistant that helps users chat with documents, extract insights, and generate structured learning paths.",
  icons: "/piper-mascot.svg"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider>
            <SidebarProvider>
              {children}
              <ToastContainer />

            </SidebarProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
