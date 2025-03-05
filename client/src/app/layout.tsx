import type { Metadata } from "next";
import { Fira_Code } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/provider/ThemeProvider";

const inter = Fira_Code({ subsets: ["cyrillic"] });

export const metadata: Metadata = {
  title: "Piper - AI Knowledge Assistant",
  description: "Piper is an AI-powered knowledge assistant that helps users chat with documents, extract insights, and generate structured learning paths.",
  icons: "/favicon.svg",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <ThemeProvider>{children}</ThemeProvider>        
      </body>
    </html>
  );
}
