import Link from "next/link";
import { Bird, Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "@/provider/ThemeProvider";

const NavBar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur bg-transparent">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Bird className="text-[#00bcff]" size={28} />
          <span className="text-xl font-medium">Piper AI</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm hover:text-primary">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm hover:text-primary">
            How It Works
          </Link>
          <Link href="#testimonials" className="text-sm  hover:text-primary">
            Testimonials
          </Link>
          <a href="/plus?ref=top" className="group py-2 relative px-1.5 text-sm/6 text-text-1 dark:text-sky-300"><span className="absolute inset-0 border border-dashed border-sky-300/60 bg-sky-400/10 group-hover:bg-sky-400/15 dark:border-sky-300/30"></span>Get Started<svg width="5" height="5" viewBox="0 0 5 5" className="absolute top-[-2px] left-[-2px] fill-sky-300 dark:fill-sky-300/50"><path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path></svg><svg width="5" height="5" viewBox="0 0 5 5" className="absolute top-[-2px] right-[-2px] fill-sky-300 dark:fill-sky-300/50"><path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path></svg><svg width="5" height="5" viewBox="0 0 5 5" className="absolute bottom-[-2px] left-[-2px] fill-sky-300 dark:fill-sky-300/50"><path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path></svg><svg width="5" height="5" viewBox="0 0 5 5" className="absolute right-[-2px] bottom-[-2px] fill-sky-400 dark:fill-sky-300/50"><path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path></svg></a>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
