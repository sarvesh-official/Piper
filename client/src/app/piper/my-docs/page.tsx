"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, File, FileText } from "lucide-react";
import "react-circular-progressbar/dist/styles.css";
import {
  getUserUploadedDocuments,
  getUserGeneratedDocuments,
  downloadDocument,
  UploadedDocument,
  GeneratedDocument
} from "@/app/api/documents/api";

const getFileIcon = (fileName: string) => {
  if (fileName.endsWith(".pdf")) return <FileText className="text-red-500" size={20} />;
  if (fileName.endsWith(".csv")) return <FileText className="text-green-500" size={20} />;
  if (fileName.endsWith(".docx")) return <FileText className="text-blue-500" size={20} />;
  if (fileName.endsWith(".ppt")) return <FileText className="text-orange-500" size={20} />;
  return <File size={20} />;
};

const MyDocs = () => {
  
  const {getToken} = useAuth();

  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      
      setIsLoading(true);
      setError(null);
      
      try {
        const token = await getToken();
        
        if (!token) {
          throw new Error("Authentication token not available");
        }
        
        const [uploaded, generated] = await Promise.all([
          getUserUploadedDocuments(token),
          getUserGeneratedDocuments(token)
        ]);
        
        setUploadedDocs(uploaded);
        setGeneratedDocs(generated);
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError("Failed to load your documents. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, [getToken]);
  
  const handleDownload = async (doc: UploadedDocument | GeneratedDocument) => {
    try {
            
      await downloadDocument(doc.fileUrl, doc.name);
    } catch (err) {
      console.error("Error downloading document:", err);
      setError("Failed to download the document. Please try again later.");
    }
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
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
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
          {isLoading ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading documents...</p>
          ) : uploadedDocs.length > 0 ? (
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
                      handleDownload(doc);
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
            <p className="text-sm text-gray-600 dark:text-gray-400">No documents uploaded yet.</p>
          )}
        </motion.div>
      </motion.div>
      
      {/* Generated Documents Section */}
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
          {isLoading ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading documents...</p>
          ) : generatedDocs.length > 0 ? (
            generatedDocs.map((doc) => (
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
                      handleDownload(doc);
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
            <p className="text-sm text-gray-600 dark:text-gray-400">No generated documents available</p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MyDocs;
