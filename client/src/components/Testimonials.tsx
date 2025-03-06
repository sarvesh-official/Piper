
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    content:
      "Piper has completely transformed how I study. The AI course generator saved me countless hours of planning, and the document chat feels like having a tutor available 24/7.",
    name: "Alex Johnson",
    title: "PhD Student, MIT",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    rating: 5,
  },
  {
    id: 2,
    content:
      "As a teacher, I've seen my students' engagement skyrocket since introducing Piper. The personalized learning paths help each student progress at their own pace while keeping them challenged.",
    name: "Maya Rodriguez",
    title: "High School Science Teacher",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    rating: 5,
  },
  {
    id: 3,
    content:
      "Learning complex software development concepts used to take me weeks. With Piper, I can understand and apply new frameworks in days. The structured pathways build on each concept perfectly.",
    name: "David Chen",
    title: "Software Engineer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    rating: 4,
  },
  {
    id: 4,
    content:
      "The smart search feature is magical - it finds exactly what I need across all my textbooks and notes, even when I phrase questions in different ways. Truly understands what I'm looking for.",
    name: "Sarah Williams",
    title: "Medical Resident",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    rating: 5,
  },
  {
    id: 5,
    content:
      "Piper helped me prepare for professional certifications while working full-time. The personalized study schedule and focused review sessions made all the difference - passed on my first try!",
    name: "James Wilson",
    title: "Finance Professional",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    rating: 5,
  },
];

export const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const slideInterval = useRef<number | null>(null);

  const startAutoSlide = () => {
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
    }
    
    slideInterval.current = window.setInterval(() => {
      setIsAnimating(true);
      setActiveIndex((prev) => (prev + 1) % (testimonials.length - 2 + 1));
      setTimeout(() => setIsAnimating(false), 500);
    }, 5000);
  };

  useEffect(() => {
    startAutoSlide();
    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
    };
  }, []);

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 3 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
    startAutoSlide();
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev + 1) % (testimonials.length - 2 + 1));
    setTimeout(() => setIsAnimating(false), 500);
    startAutoSlide();
  };

  return (
    <section
      id="testimonials"
      className="py-20 bg-gray-50 dark:bg-gray-900/50 relative overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,188,255,0.05),transparent_35%),radial-gradient(circle_at_70%_30%,rgba(83,107,250,0.05),transparent_30%)]"
        aria-hidden="true"
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-piper-purple/10 dark:bg-piper-purple/20 border border-piper-purple/20 mb-6">
            <span className="text-xs font-semibold text-piper-purple">
              What Our Users Say
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            Success Stories from Piper Users
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            See how Piper is transforming learning experiences for students, professionals, and educators around the world.
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${activeIndex * (100 / 3)}%)`,
              }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="min-w-[100%] sm:min-w-[50%] lg:min-w-[33.333%] px-4"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col">
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < testimonial.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 flex-grow mb-6">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-4 object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {testimonial.title}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
