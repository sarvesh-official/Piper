"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import courseApi, { Course } from "@/app/api/course/api";
import CourseCard from "@/components/courses/CourseCard";

const Dashboard = () => {

  const [coursesData, setCoursesData] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all courses
  useEffect(() => {
    fetchCourses();
  }, []);

  // Function to fetch all courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const courses = await courseApi.getUserCourses();
      setCoursesData(courses);
      setError("");
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      setError(err.message || "Failed to load courses. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6 max-w-7xl mx-auto p-3 sm:p-4 md:p-6 h-[85vh]">
      <motion.div
        className="p-3 sm:p-4 md:p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">Your Courses</h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Explore all your enrolled courses</p>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-32 md:h-40">
            <motion.div 
              className="w-6 h-6 md:w-8 md:h-8 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 md:p-4 rounded-lg">
            <p className="text-xs md:text-sm text-red-500 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-10 overflow-y-auto max-h-[60vh] md:max-h-[65vh] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 pr-1 md:pr-2">
            {coursesData?.length > 0 ? (
              coursesData.map((course, index) => (
                <motion.div
                  key={course._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <CourseCard
                    id={course._id || `course-${index}`}
                    title={course.title}
                    description={course.description || ""}
                    progress={course.progress}
                    index={index}
                  />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center p-4 md:p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-3 md:mb-4">
                  No courses found. Start exploring and enroll in new courses!
                </p>
                <button 
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white text-sm md:text-base rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => window.location.href = '/piper/explore-courses'}
                >
                  Explore Courses
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
