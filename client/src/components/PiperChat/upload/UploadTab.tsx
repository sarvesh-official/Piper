import { useState } from "react"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { uploadFilesToBackend } from "@/app/api/file-upload/api"
import { createChat } from "@/app/api/chat-api/api"

import { UploadArea } from "./UploadArea"
import { FileList } from "./FileList"
import { ErrorMessage } from "../shared/ErrorMessage"

export function UploadTab() {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploadedFiles, setUploadedFiles] = useState<{ fileName: string; fileUrl: string; fileKey: string }[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [duplicateError, setDuplicateError] = useState<string | null>(null)
  
  const router = useRouter()
  const { getToken, userId } = useAuth()
  
  const handleUploadFiles = async () => {
    if (!files.length) return;
    
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress({});
    
    try {
      const token = await getToken();
      
      if (!userId || !token) {
        throw new Error('Authentication required. Please sign in.');
      }
      
      const uploaded = await uploadFilesToBackend(
        files,
        userId,
        token,
        (fileName, percentage) => {
          setUploadProgress(prev => ({
            ...prev,
            [fileName]: percentage
          }));
        }
      );
      
      setUploadedFiles(uploaded);
      
      const response = await createChat(userId, uploaded, token);
      
      if (response.success && response.chatId) {
        router.push(`/piper/chat/${response.chatId}`);
      } else {
        throw new Error('Failed to create chat');
      }
      
    } catch (error: any) {
      console.error('Upload failed:', error);
      setUploadError(error.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const addFiles = (selectedFiles: File[]) => {
    const newTotal = files.length + selectedFiles.length;
    
    if (newTotal > 3) {
      alert(`You can upload a maximum of 3 files per chat. You can add ${3 - files.length} more.`);
      return;
    }
    
    const duplicateFiles = selectedFiles.filter(newFile => 
      files.some(existingFile => existingFile.name === newFile.name)
    );

    if (duplicateFiles.length > 0) {
      setDuplicateError(
        duplicateFiles.length === 1
          ? `"${duplicateFiles[0].name}" has already been added.`
          : `${duplicateFiles.length} files have already been added.`
      );
    } else {
      setDuplicateError(null);
    }
    
    const uniqueFiles = selectedFiles.filter(newFile => 
      !files.some(existingFile => existingFile.name === newFile.name)
    );
    
    setFiles(prev => [...prev, ...uniqueFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-3 sm:p-6 h-full flex flex-col pt-6 items-center justify-center">
      <UploadArea 
        onFilesAdded={addFiles}
        isUploading={isUploading}
        filesCount={files.length}
      />

      <div className="w-full max-w-xs sm:max-w-md mt-3 sm:mt-6 pb-3 sm:pb-6 md:pb-0">
        <h4 className="text-xs sm:text-sm font-normal mb-1 sm:mb-2">Uploaded Files</h4>
        
        <FileList 
          files={files}
          removeFile={removeFile}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />

        <ErrorMessage message={uploadError} type="error" />
        <ErrorMessage message={duplicateError} type="warning" />

        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 sm:mt-4">
            <button 
              onClick={handleUploadFiles}
              disabled={isUploading}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white dark:text-piper-darkblue bg-piper-blue dark:bg-piper-cyan dark:hover:bg-piper-cyan/90 hover:bg-piper-blue/90 transition-colors disabled:opacity-70"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Uploading...
                </>
              ) : 'Process Files'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
