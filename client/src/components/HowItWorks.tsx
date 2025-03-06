
import { CheckCircle2, CircleUserRound, FileInput, GraduationCap } from "lucide-react";

const steps = [
  {
    id: "01",
    title: "Sign Up",
    description:
      "Create your personalized Piper account in seconds and tell us about your learning goals and preferences.",
    icon: CircleUserRound,
  },
  {
    id: "02",
    title: "Upload Materials",
    description:
      "Add your existing learning materials or choose from our library of curated educational resources.",
    icon: FileInput,
  },
  {
    id: "03",
    title: "Get Personalized Plan",
    description:
      "Our AI analyzes your materials and goals to create a tailored learning pathway optimized for your success.",
    icon: CheckCircle2,
  },
  {
    id: "04",
    title: "Learn & Improve",
    description:
      "Follow your custom curriculum with AI assistance that adapts to your progress and learning style.",
    icon: GraduationCap,
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-piper-blue/10 dark:bg-piper-cyan/20 border border-piper-blue/20 dark:border-piper-cyan/20  mb-6">
            <span className="text-xs font-semibold text-piper-blue dark:text-piper-cyan">
              Simple Process, Powerful Results
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            How Piper Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Getting started with Piper is easy. Our streamlined process takes you from signup to smarter learning in just a few steps.
          </p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-piper-blue via-piper-cyan to-piper-blue dark:from-piper-cyan dark:via-piper-blue dark:to-piper-cyan hidden md:block" aria-hidden="true" />

          <div className="space-y-16 relative">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative md:grid md:grid-cols-2 md:gap-12 md:items-center"
              >
                <div
                  className={`md:col-span-1 ${
                    index % 2 === 0 ? "md:order-1" : "md:order-2"
                  }`}
                >
                  <div className="md:pr-8 md:pl-0 px-4">
                    <div
                      className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 relative z-10 animate-fade-in"
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <div className="absolute -inset-px bg-gradient-blue opacity-5 blur-sm rounded-2xl" />
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-piper-blue dark:bg-piper-cyan text-white">
                          <step.icon size={24} />
                        </div>
                        <span className="text-4xl font-bold text-gray-300 dark:text-gray-700">
                          {step.id}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline Node (visible on md and above) */}
                <div className="hidden md:col-span-1 md:flex md:justify-center">
                  <div
                    className={`w-12 h-12 rounded-full bg-piper-blue dark:bg-piper-cyan flex items-center justify-center border-4 border-white dark:border-gray-900 text-white relative z-10 animate-pulse-slow`}
                  >
                    <span className="text-xl font-bold">{step.id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
