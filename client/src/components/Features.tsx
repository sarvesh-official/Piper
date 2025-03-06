
import { BookText, MessageSquare, Search, GitBranch, Zap, Shield, Cpu, Users } from "lucide-react";

const features = [
  {
    title: "AI-Generated Courses",
    description:
      "Create custom learning paths based on your interests and goals with our advanced AI that curates content from diverse sources.",
    icon: BookText,
    color: "bg-blue-500/10 dark:bg-blue-500/20",
    iconColor: "text-blue-500",
  },
  {
    title: "Document Chat",
    description:
      "Ask questions and get instant answers from your learning materials, as if you're having a conversation with your textbooks.",
    icon: MessageSquare,
    color: "bg-purple-500/10 dark:bg-purple-500/20",
    iconColor: "text-purple-500",
  },
  {
    title: "Smart Search",
    description:
      "Find exactly what you need across all your resources with our semantic search that understands concepts, not just keywords.",
    icon: Search,
    color: "bg-green-500/10 dark:bg-green-500/20",
    iconColor: "text-green-500",
  },
  {
    title: "Structured Learning Paths",
    description:
      "Follow expertly designed learning sequences that build foundational knowledge first, ensuring you master concepts in the optimal order.",
    icon: GitBranch,
    color: "bg-amber-500/10 dark:bg-amber-500/20",
    iconColor: "text-amber-500",
  },
  {
    title: "Fast Learning",
    description:
      "Accelerate your learning journey with AI-optimized study sessions and targeted practice exercises that focus on your weak areas.",
    icon: Zap,
    color: "bg-red-500/10 dark:bg-red-500/20",
    iconColor: "text-red-500",
  },
  {
    title: "Privacy First",
    description:
      "Your learning data stays private and secure with our locally-processed AI that never compromises your personal information.",
    icon: Shield,
    color: "bg-indigo-500/10 dark:bg-indigo-500/20",
    iconColor: "text-indigo-500",
  },
  {
    title: "Smart Recommendations",
    description:
      "Receive personalized content suggestions that adapt to your learning style, preferences, and progress in real-time.",
    icon: Cpu,
    color: "bg-pink-500/10 dark:bg-pink-500/20",
    iconColor: "text-pink-500",
  },
  {
    title: "Community Learning",
    description:
      "Connect with peers studying similar topics to share insights, resources, and motivation through our collaborative platform.",
    icon: Users,
    color: "bg-teal-500/10 dark:bg-teal-500/20",
    iconColor: "text-teal-500",
  },
];

export const Features = () => {
  return (
    <section
      id="features"
      className="py-20 bg-gray-50 dark:bg-gray-900/50 relative overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(83,107,250,0.05),transparent_35%),radial-gradient(circle_at_85%_30%,rgba(0,188,255,0.05),transparent_30%)]"
        aria-hidden="true"
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            Supercharge Your Learning Journey
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Piper combines cutting-edge AI with thoughtful learning design to create a revolutionary educational experience that adapts to how you learn best.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 ${feature.color}`}
              >
                <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
