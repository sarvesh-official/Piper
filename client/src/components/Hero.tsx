import Typewriter from "typewriter-effect";

const Hero = () => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-6 justify-center md:justify-between px-6 md:px-16">
      {/* Left Section: Typewriter + Headline */}
      <div className="flex flex-col gap-6 font-bold leading-relaxed">
        <div className="flex gap-3 w-full roll-in-left text-2xl md:text-4xl xl:text-5xl pt-10 items-center">
          <h1 className="text-text-1">{`>`}</h1>
          <h1 className="hidden md:block w-full">
            <Typewriter
              options={{
                strings: [
                  "Learn Smarter",
                  "Chat with Your Documents",
                  "Generate Courses Instantly",
                  "Find Answers Faster",
                  "AI-Powered Learning",
                ],
                delay:60, 
                deleteSpeed: 20,
                autoStart: true,
                loop: true
              }}
            />
          </h1>
          <h1 className="w-full md:hidden text-2xl">
            <Typewriter
              options={{
                strings: [
                  "Learn Smarter",
                  "Generate Courses",
                  "Chat with Documents",
                ],
                delay: 60,
                deleteSpeed: 20,
                autoStart: true,
                loop: true,
              }}
            />
          </h1>
        </div>

        {/* Supporting Text (Simplified) */}
        <p className="text-sm md:text-lg font-medium">
          Struggling with scattered resources? <br />
          <span className="text-text-1 font-semibold">Piper AI</span> organizes your learning,  
          simplifies research, and helps you master new skills—faster.
        </p>

        <p className="text-xs md:text-md font-normal">
          Unlock structured courses, AI-powered search, and powerful document chat.
        </p>
      </div>

      {/* Right Section: Placeholder for Future Illustration */}
      <div className="hidden md:flex items-center justify-center w-[500px] h-[450px]"></div>
    </div>
  );
};

export default Hero;
