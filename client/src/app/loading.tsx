"use client";

import { useEffect } from "react";

const Loading = () => {
  useEffect(() => {
    async function getLoader() {
      const { trio } = await import("ldrs");
      trio.register();
    }
    getLoader();
  }, []);
  return (
    <div className="h-screen pt-24 w-full flex md:items-center md:justify-center bg-background text-foreground relative overflow-hidden bg-grid-black/[0.2] dark:bg-grid-white/[0.02] ">
      {" "}
          {/* <div className="rounded-full h-20 w-20 bg-primary-3 animate-ping"></div> */}
          <l-trio
            size="70"
            stroke-length="0.15"
            bg-opacity="0.1"
            speed="1.4"
            color="#00BCFF"
          ></l-trio>
        </div>

  );
};

export default Loading;
