"use client"
import { WarpBackground } from "@/components/magicui/warp-background";
import { useTheme } from "@/provider/ThemeProvider";
import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function Page() {

  const {theme} = useTheme();

  return (
    <section className="grid w-screen h-screen grid-cols-1 md:grid-cols-[60%_40%] relative">
      <div className="relative z-10">
        <WarpBackground className="md:h-screen flex items-center justify-center">
          {" "}

          {
            theme == "light" ? 
            <Image
              src="/mockup.webp"
              height={1000}
              width={1000}
              alt="mockup"
              className="object-cover md:object-contain w-full h-full"
            /> :  <Image
            src="/dark-mockup.webp"
            height={1000}
            width={1000}
            alt="mockup"
            className="object-cover md:object-contain w-full h-full"
          />
          }
        </WarpBackground>
      </div>

      <div className="relative flex items-center justify-center bg-white dark:bg-gray-900 p-6">
        <div className="absolute inset-0 z-0 dark:invert">
          <img
            src="/abstract-grid.svg"
            alt=""
            className="w-full h-full object-cover dark:opacity-50 opacity-75"
          />
        </div>

        <SignIn />
      </div>
    </section>
  );
}
