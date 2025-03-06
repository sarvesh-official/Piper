"use client";
import  { Navbar } from "@/components/NavBar";
import { useEffect, useState } from "react";
import Loading from "./loading";
import Hero from "@/components/Hero";
import CourseGenerator from "@/components/CourseGenerator";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import { Spotlight } from "@/components/ui/spotlight";
import { useTheme } from "@/provider/ThemeProvider";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  
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
        <div className="min-h-screen flex flex-col">

      <Navbar />
      {
        theme == "light" ? 
        <Spotlight className="hidden md:block bottom-3 md:left-60 md:-top-20" fill="#536bfa" /> : <Spotlight className="hidden md:block bottom-3 md:left-60 md:-top-20" fill="#00BCFF" />
      }
      <main className="flex-grow">
        <Hero />
        <CourseGenerator />
        <Features/>
        <HowItWorks/>
        <Testimonials/>
        <Footer/>
      </main>
    </div>
      )}
    </>
  );
}
