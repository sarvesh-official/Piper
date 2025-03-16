"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Download, File, FileText, Loader2 } from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useTheme } from "@/provider/ThemeProvider";
import { useAuth } from "@clerk/nextjs";
import { 
  fetchDashboardChatSummaries, 
  fetchDashboardCourseSummaries,
  ChatSummary,
  CourseSummary
} from "../api/dashboard-api";

const proverbs = [
  "The expert in anything was once a beginner.",
  "An investment in knowledge pays the best interest.",
  "Small steps every day lead to big results.",
  "Success is the sum of small efforts repeated daily.",
];

const getFileIcon = (fileName: string) => {
  if (fileName.endsWith(".pdf")) return <FileText className="text-red-500" size={20} />;
  if (fileName.endsWith(".csv")) return <FileText className="text-green-500" size={20} />;
  if (fileName.endsWith(".docx")) return <FileText className="text-blue-500" size={20} />;
  if (fileName.endsWith(".ppt")) return <FileText className="text-orange-500" size={20} />;
  return <File size={20} />;
};

const Dashboard = () => {
  const { user } = useUser();
  const [currentTime, setCurrentTime] = useState("");
  const [proverb, setProverb] = useState(proverbs[0]);
  const router = useRouter();
  const { theme } = useTheme();
  const { getToken } = useAuth();
  
  // Add states for chat activities and courses
  const [chatSummaries, setChatSummaries] = useState<ChatSummary[]>([]);
  const [courseSummaries, setCourseSummaries] = useState<CourseSummary[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);

    const proverbInterval = setInterval(() => {
      setProverb(proverbs[Math.floor(Math.random() * proverbs.length)]);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(proverbInterval);
    };
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = await getToken();

        if (!token) {
          throw new Error("Failed to get token");
        }
        
        // Use Promise.all to fetch both data sources in parallel
        const [chatData, courseData] = await Promise.all([
          fetchDashboardChatSummaries(token),
          fetchDashboardCourseSummaries(token)
        ]);
        
        setChatSummaries(chatData);
        setCourseSummaries(courseData);
        console.log("Chat Summaries:", chatData);
        console.log("Course Summaries:", courseData);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoadingChats(false);
        setIsLoadingCourses(false);
      }
    };
    
    fetchDashboardData();
  }, [getToken]);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto p-6 h-[85vh]">
      {/* User Greeting */}
      <motion.div
        className="min-h-[200px] sm:min-h-[220px] md:min-h-[170px] w-full bg-hero rounded-[20px] bg-white dark:bg-gray-900 shadow-md flex flex-col justify-between p-4 sm:p-6 lg:p-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="glassmorphism max-w-[220px] sm:max-w-[270px] w-fit rounded py-1 sm:py-2 px-2 text-left text-xs sm:text-sm font-normal text-white">
          Welcome Back,&nbsp; <span className="text-piper-blue dark:text-piper-cyan">{user?.firstName}!</span>
        </h2>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 sm:gap-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold lg:text-6xl text-white">{currentTime}</h1>
          <p className="text-xs text-white max-w-[200px] sm:text-right">{proverb} ✨</p>
        </div>
      </motion.div>
      
      {/* Activity Slider */}
      <motion.div
        className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-lg font-semibold mb-4">Your Chats</h2>
        {isLoadingChats ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : chatSummaries.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">No chat activities yet.</p>
        ) : (
          <div className="flex flex-col gap-4 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 md:pr-2">
            {chatSummaries.map((chat, index) => (
              <motion.div
                key={index}
                className="relative p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                onClick={() => router.push(`/piper/chat/${chat.id}`)}
              >
                <button
                  className="absolute top-2 right-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/piper/chat/${chat.id}`);
                  }}
                >
                  <ArrowRight size={16} />
                </button>
                
                <h3 className="text-md font-semibold mb-2 pr-8">{chat.topic}</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">💬 {chat.chat}</p>
                
                <div className="mt-3 flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="w-12 h-12">
                    {
                      theme === "light" ? 
                        <CircularProgressbar
                          value={chat.quiz}
                          text={`${chat.quiz}%`}
                          styles={buildStyles({
                            textSize: "30px",
                            pathColor: "#536BFA",
                            textColor: "#536BFA",
                          })} 
                        /> : 
                        <CircularProgressbar
                          value={chat.quiz}
                          text={`${chat.quiz}%`}
                          styles={buildStyles({
                            textSize: "30px",
                            pathColor: "#00BCFF",
                            textColor: "#00BCFF",
                          })} 
                        />
                    }
                  </div>
                  <div className="flex-1 w-full">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Quiz Progress</p>
                    <div className="flex flex-col sm:flex-row justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(chat.files) && chat.files.map((file, i) => (
                          <div key={i} className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 p-1.5 rounded-lg">
                            {getFileIcon(file.fileName)}
                            <span className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 max-w-[100px] sm:max-w-[130px] truncate">
                              {file.fileName}
                            </span>
                            <button 
                              className="p-1 bg-gray-300 dark:bg-gray-600 rounded-full hover:bg-gray-400"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Download size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button 
                        className="p-2 bg-piper-blue dark:bg-piper-cyan dark:text-piper-darkblue hover:bg-blue-600 text-white rounded-lg flex items-center font-medium gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download size={16} />
                        <span className="text-sm">Quiz</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
      
      {/* Created Courses */}
      <motion.div
        className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Courses</h2>
        {isLoadingCourses ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 md:pr-2">
            {courseSummaries?.length > 0 ? (
              courseSummaries.map((course, index) => (
                <motion.div
                  key={index}
                  className="relative cursor-pointer rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-gray-800 p-4 hover:shadow-lg transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  onClick={() => router.push(`/piper/learning/course/${course._id}`)}
                >
                  <button
                    className="absolute top-2 right-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300"
                    onClick={() => router.push(`/piper/learning/course/${course._id}`)}
                  >
                    <ArrowRight size={16} />
                  </button>
                  <h2 className="text-lg font-semibold">{course.title}</h2>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-600">
                      <div className="h-full rounded-full bg-piper-blue dark:bg-piper-cyan" style={{ width: `${course.progress}%` }}></div>
                    </div>
                    <p className="text-xs font-medium">{course.progress}%</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">No courses created yet.</p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
