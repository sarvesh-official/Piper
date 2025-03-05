"use client";
import NavBar from "@/components/NavBar";
import { Spotlight } from "@/components/ui/Spotlight";
import { useEffect, useState } from "react";
import Loading from "./loading";
import Hero from "@/components/Hero";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="flex items-center flex-col">
          <NavBar />
          <div className="md:h-[42rem] h-[30rem] w-full flex flex-col md:flex-row md:items-center md:justify-center px-4 sm:px-6 lg:px-12 bg-gray-50 dark:bg-background text-foreground relative overflow-hidden bg-grid-black/[0.09] dark:bg-grid-white/[0.02]">
            {/* Spotlight Effect - Adjusted for Mobile */}
            <Spotlight className="hidden md:block bottom-3 md:left-60 md:-top-20" fill="#00bcff" />
            <Hero />
          </div>
        </div>
      )}
    </>
  );
}
