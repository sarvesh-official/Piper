"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { courses } from "../../data/course";
import { ArrowRight, Download, File, FileText } from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useTheme } from "@/provider/ThemeProvider";

const proverbs = [
  "The expert in anything was once a beginner.",
  "An investment in knowledge pays the best interest.",
  "Small steps every day lead to big results.",
  "Success is the sum of small efforts repeated daily.",
];

const activities = [
  {
    id: "chat1",
    topic: "How AI is Changing Education",
    chat: "Discussion on AI's role in modern education",
    quiz: 85,
    files: ["NextJS_Tutorial.pdf", "AI_Education_Research.docx"],
  },
  {
    id: "chat2",
    topic: "Introduction to Web Development",
    chat: "Basic concepts of frontend and backend",
    quiz: 60,
    files: ["HTML_CSS_Guide.ppt", "JS_Introduction.pdf"],
  },
  {
    id: "chat3",
    topic: "Machine Learning Basics",
    chat: "Understanding ML algorithms",
    quiz: 75,
    files: ["ML_Notes.csv", "DeepLearning_Overview.pdf"],
  },
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
  const {theme} = useTheme();

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
        <div className="flex flex-col gap-4 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 md:pr-2">
          {activities.map((activity, index) => (
            <motion.div
              key={index}
              className="relative p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              onClick={() => router.push(`/chat?id=${activity.id}`)}
            >
              <button
                className="absolute top-2 right-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/chat?id=${activity.id}`);
                }}
              >
                <ArrowRight size={16} />
              </button>
              
              <h3 className="text-md font-semibold mb-2 pr-8">{activity.topic}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">💬 {activity.chat}</p>
              
              <div className="mt-3 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="w-12 h-12">
                  {
                    theme == "light" ? <CircularProgressbar
                    value={activity.quiz}
                    text={`${activity.quiz}%`}
                    styles={buildStyles({
                      textSize: "30px",
                      pathColor: "#536BFA",
                      textColor: "#536BFA",
                    })} /> : <CircularProgressbar
                    value={activity.quiz}
                    text={`${activity.quiz}%`}
                    styles={buildStyles({
                      textSize: "30px",
                      pathColor: "#00BCFF",
                      textColor: "#00BCFF",
                    })} />
                  }
                  
                 
                </div>
                <div className="flex-1 w-full">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Quiz Progress</p>
                  <div className="flex flex-col sm:flex-row justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      {activity.files.map((file, i) => (
                        <div key={i} className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 p-1.5 rounded-lg">
                          {getFileIcon(file)}
                          <span className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 max-w-[100px] sm:max-w-[130px] truncate">
                            {file}
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
      </motion.div>
      {/* Created Courses */}
      <motion.div
        className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 md:pr-2">
          {courses?.length > 0 ? (
            courses.map((course, index) => (
              <motion.div
                key={index}
                className="relative cursor-pointer rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-gray-800 p-4 hover:shadow-lg transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                onClick={() => router.push(`/course?id=${course._id}`)}
              >
                <button
                  className="absolute top-2 right-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300"
                  onClick={() => router.push(`/course?id=${course._id}`)}
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
      </motion.div>
    </div>
  );
};

export default Dashboard;
