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
    <div className="h-screen w-full flex items-center justify-center">
      {" "}
          {/* <div className="rounded-full h-20 w-20 bg-primary-3 animate-ping"></div> */}
          <l-trio
            size="70"
            stroke-length="0.15"
            bg-opacity="0.1"
            speed="1.4"
            color="#536BFA"
          ></l-trio>
        </div>

  );
};

export default Loading;
