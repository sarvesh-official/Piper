"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Download, File, FileText } from "lucide-react";
import "react-circular-progressbar/dist/styles.css";
import { useTheme } from "@/provider/ThemeProvider";

// Sample data - in a real app, this would come from an API
const uploadedDocs = [
  {
    id: "doc1",
    name: "NextJS_Tutorial.pdf",
    topic: "How AI is Changing Education",
    dateUploaded: "2023-10-15",
  },
  {
    id: "doc2",
    name: "AI_Education_Research.docx",
    topic: "Research Paper",
    dateUploaded: "2023-10-16",
  },
  {
    id: "doc3",
    name: "HTML_CSS_Guide.ppt",
    topic: "Web Development Basics",
    dateUploaded: "2023-10-17",
  },
  {
    id: "doc13",
    name: "NextJS_Tutorial.pdf",
    topic: "How AI is Changing Education",
    dateUploaded: "2023-10-15",
  },
  {
    id: "doc21",
    name: "AI_Education_Research.docx",
    topic: "Research Paper",
    dateUploaded: "2023-10-16",
  },
  {
    id: "doc30",
    name: "HTML_CSS_Guide.ppt",
    topic: "Web Development Basics",
    dateUploaded: "2023-10-17",
  },
  {
    id: "doc12",
    name: "NextJS_Tutorial.pdf",
    topic: "How AI is Changing Education",
    dateUploaded: "2023-10-15",
  },
  {
    id: "doc24",
    name: "AI_Education_Research.docx",
    topic: "Research Paper",
    dateUploaded: "2023-10-16",
  },
  {
    id: "doc3f",
    name: "HTML_CSS_Guide.ppt",
    topic: "Web Development Basics",
    dateUploaded: "2023-10-17",
  },
  {
    id: "doc1a",
    name: "NextJS_Tutorial.pdf",
    topic: "How AI is Changing Education",
    dateUploaded: "2023-10-15",
  },
  {
    id: "doc2gg",
    name: "AI_Education_Research.docx",
    topic: "Research Paper",
    dateUploaded: "2023-10-16",
  },
  {
    id: "doc3da",
    name: "HTML_CSS_Guide.ppt",
    topic: "Web Development Basics",
    dateUploaded: "2023-10-17",
  },
];

const exportedDocs = [
  {
    id: "exp1aa",
    name: "AI_Education_Quiz.pdf",
    topic: "AI in Education Quiz",
    dateGenerated: "2023-10-18",
    type: "quiz",
  },
  {
    id: "exp2ff",
    name: "WebDev_Assessment.pdf",
    topic: "Web Development Assessment",
    dateGenerated: "2023-10-19",
    type: "quiz",
  },
  {
    id: "exp3qq",
    name: "ML_Notes_Summary.csv",
    topic: "Machine Learning Notes",
    dateGenerated: "2023-10-20",
    type: "notes",
  },
  {
    id: "exp1",
    name: "AI_Education_Quiz.pdf",
    topic: "AI in Education Quiz",
    dateGenerated: "2023-10-18",
    type: "quiz",
  },
  {
    id: "exp2a",
    name: "WebDev_Assessment.pdf",
    topic: "Web Development Assessment",
    dateGenerated: "2023-10-19",
    type: "quiz",
  },
  {
    id: "exp39",
    name: "ML_Notes_Summary.csv",
    topic: "Machine Learning Notes",
    dateGenerated: "2023-10-20",
    type: "notes",
  },
  {
    id: "exp10",
    name: "AI_Education_Quiz.pdf",
    topic: "AI in Education Quiz",
    dateGenerated: "2023-10-18",
    type: "quiz",
  },
  {
    id: "exp22",
    name: "WebDev_Assessment.pdf",
    topic: "Web Development Assessment",
    dateGenerated: "2023-10-19",
    type: "quiz",
  },
  {
    id: "exp36",
    name: "ML_Notes_Summary.csv",
    topic: "Machine Learning Notes",
    dateGenerated: "2023-10-20",
    type: "notes",
  },
  {
    id: "exp13",
    name: "AI_Education_Quiz.pdf",
    topic: "AI in Education Quiz",
    dateGenerated: "2023-10-18",
    type: "quiz",
  },
  {
    id: "exp21",
    name: "WebDev_Assessment.pdf",
    topic: "Web Development Assessment",
    dateGenerated: "2023-10-19",
    type: "quiz",
  },
  {
    id: "exp32",
    name: "ML_Notes_Summary.csv",
    topic: "Machine Learning Notes",
    dateGenerated: "2023-10-20",
    type: "notes",
  },
];


const getFileIcon = (fileName: string) => {
  if (fileName.endsWith(".pdf")) return <FileText className="text-red-500" size={20} />;
  if (fileName.endsWith(".csv")) return <FileText className="text-green-500" size={20} />;
  if (fileName.endsWith(".docx")) return <FileText className="text-blue-500" size={20} />;
  if (fileName.endsWith(".ppt")) return <FileText className="text-orange-500" size={20} />;
  return <File size={20} />;
};

const MyDocs = () => {
  const { user } = useUser();
  const router = useRouter();
  const { theme } = useTheme();
  
  const handleDownload = (docName: string) => {
    // Create some sample content based on the document name
    const content = `This is a simulated download of ${docName}.\nIn a production environment, this would be the actual file content.`;
    
    // Create a Blob containing the content
    const blob = new Blob([content], { type: 'text/plain' });
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = docName;
    document.body.appendChild(a);
    
    // Trigger the download
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };
  
  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-5xl mx-auto p-3 sm:p-6 h-full min-h-[85vh]">
      {/* User Greeting */}
      <motion.h1 
        className="text-xl sm:text-2xl font-bold px-1"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        My Documents
      </motion.h1>
      
      {/* Uploaded Documents Section */}
      <motion.div
        className="p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Uploaded Documents</h2>
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 max-h-[280px] sm:max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 pr-1 md:pr-2"
          variants={containerAnimation}
          initial="hidden"
          animate="show"
        >
          {uploadedDocs.length > 0 ? (
            uploadedDocs.map((doc) => (
              <motion.div
                key={doc.id}
                className="relative cursor-pointer rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-gray-800 p-3 sm:p-4 hover:shadow-lg transition-all"
                variants={itemAnimation}
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getFileIcon(doc.name)}
                    <span className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-[150px]">{doc.name}</span>
                  </div>
                  <button
                    className="p-1 ml-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(doc.name);
                    }}
                    aria-label={`Download ${doc.name}`}
                  >
                    <Download size={14} className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 truncate">{doc.topic}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Uploaded: {doc.dateUploaded}</p>
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">No documents available.</p>
          )}
        </motion.div>
      </motion.div>
      
      {/* Exported Documents Section */}
      <motion.div
        className="p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Generated Documents</h2>
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 max-h-[280px] sm:max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 pr-1 md:pr-2"
          variants={containerAnimation}
          initial="hidden"
          animate="show"
        >
          {exportedDocs.length > 0 ? (
            exportedDocs.map((doc) => (
              <motion.div
                key={doc.id}
                className="relative cursor-pointer rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-gray-800 p-3 sm:p-4 hover:shadow-lg transition-all"
                variants={itemAnimation}
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getFileIcon(doc.name)}
                    <span className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-[150px]">{doc.name}</span>
                  </div>
                  <button
                    className="p-1 ml-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(doc.name);
                    }}
                    aria-label={`Download ${doc.name}`}
                  >
                    <Download size={14} className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 truncate">{doc.topic}</p>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500 dark:text-gray-500 truncate pr-1">Generated: {doc.dateGenerated}</p>
                  {doc.type === 'quiz' && (
                    <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-piper-blue text-white rounded-full whitespace-nowrap">Quiz</span>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">No documents available</p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MyDocs;
