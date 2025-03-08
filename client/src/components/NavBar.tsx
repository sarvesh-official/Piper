
"use client"
import { useState, useEffect } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "@/provider/ThemeProvider";
import { Button } from "./ui/button";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export const Navbar = () => {

  const { theme, toggleTheme } = useTheme();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-gradient text-2xl">Piper Ai</h1>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-sm font-medium text-gray-700 hover:text-piper-blue dark:text-gray-300 dark:hover:text-piper-cyan transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-gray-700 hover:text-piper-blue dark:text-gray-300 dark:hover:text-piper-cyan transition-colors"
            >
              How It Works
            </a>
            <a
              href="#testimonials"
              className="text-sm font-medium text-gray-700 hover:text-piper-blue dark:text-gray-300 dark:hover:text-piper-cyan transition-colors"
            >
              Testimonials
            </a>
          </nav>

          <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          <SignedOut>
          <Link href="/sign-in" className="group hidden md:inline-flex py-2 relative px-1.5 text-sm/6 text-piper-blue dark:text-piper-cyan"><span className="absolute inset-0 border border-dashed border-piper-blue bg-piper-blue/10 group-hover:bg-piper-blue/20 dark:border-piper-cyan"></span>Get Started<svg width="5" height="5" viewBox="0 0 5 5" className="absolute top-[-2px] left-[-2px] fill-piper-blue dark:fill-piper-cyan"><path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path></svg><svg width="5" height="5" viewBox="0 0 5 5" className="absolute top-[-2px] right-[-2px] fill-piper-blue dark:fill-piper-cyan"><path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path></svg><svg width="5" height="5" viewBox="0 0 5 5" className="absolute bottom-[-2px] left-[-2px] fill-piper-blue dark:fill-piper-cyan"><path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path></svg><svg width="5" height="5" viewBox="0 0 5 5" className="absolute right-[-2px] bottom-[-2px] fill-piper-blue dark:fill-piper-cyan"><path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path></svg></Link>
          </SignedOut>

          <SignedIn>
          <Link href="/dashboard" className="group hidden md:inline-flex py-2 relative px-1.5 text-sm/6 text-piper-blue dark:text-piper-cyan"><span className="absolute inset-0 border border-dashed border-piper-blue bg-piper-blue/10 group-hover:bg-piper-blue/20 dark:border-piper-cyan"></span>Dashboard<svg width="5" height="5" viewBox="0 0 5 5" className="absolute top-[-2px] left-[-2px] fill-piper-blue dark:fill-piper-cyan"><path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path></svg><svg width="5" height="5" viewBox="0 0 5 5" className="absolute top-[-2px] right-[-2px] fill-piper-blue dark:fill-piper-cyan"><path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path></svg><svg width="5" height="5" viewBox="0 0 5 5" className="absolute bottom-[-2px] left-[-2px] fill-piper-blue dark:fill-piper-cyan"><path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path></svg><svg width="5" height="5" viewBox="0 0 5 5" className="absolute right-[-2px] bottom-[-2px] fill-piper-blue dark:fill-piper-cyan"><path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path></svg></Link>
          
          </SignedIn>
            <button
              className="md:hidden text-gray-700 dark:text-gray-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a
              href="#features"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-piper-blue hover:bg-gray-50 dark:text-gray-300 dark:hover:text-piper-cyan dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-piper-blue hover:bg-gray-50 dark:text-gray-300 dark:hover:text-piper-cyan dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#testimonials"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-piper-blue hover:bg-gray-50 dark:text-gray-300 dark:hover:text-piper-cyan dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Testimonials
            </a>
            <a
              href="#get-started"
              className="block px-3 py-2 rounded-md text-base font-medium text-piper-blue hover:bg-gray-50 dark:text-piper-cyan dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;