"use client"
import { useState, useRef, useEffect, FormEvent } from "react"
import { useRouter, useParams } from "next/navigation"
import { Upload, MessageCircle, CheckSquare, FileText, Send, User, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth, useUser } from "@clerk/nextjs"
import { createChat, fetchChatById, queryChatWithDocuments } from "@/app/api/chat-api/api"
// Import Tooltip components
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import Image from "next/image"
import { Message } from "@/types/chat"
import PiperQuiz from "./PiperQuiz" 
import { formatMessageText } from "@/utils/textFormatting"



export default function PiperChat() {
  const router = useRouter()
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState<"upload" | "chat" | "quiz">("upload")
 const {user} = useUser();
 
  // Add tooltip state for upload button
  const [showUploadTooltip, setShowUploadTooltip] = useState(false)

  const [uploadedFiles, setUploadedFiles] = useState<{ fileName: string; fileUrl: string; fileKey: string }[]>([])
  
  // Chat states
  const [chatLoaded, setChatLoaded] = useState(false)
  const [chatData, setChatData] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Add this near your other state declarations
  const [debugTooltips, setDebugTooltips] = useState(false)

  // Add this new state variable to track if we've already attempted to load the chat
  const [chatLoadAttempted, setChatLoadAttempted] = useState(false)

  const { getToken, userId } = useAuth();
  

  // Loading existing chat data and setting uploaded files  
  useEffect(() => {
    const loadExistingChat = async () => {
      // Only attempt to load if we haven't already tried and we have a valid ID
      if (!chatLoadAttempted && id && id !== 'new') {
        try {
          setChatLoadAttempted(true); // Mark that we've attempted to load
          const token = await getToken();
          if (token) {
            try {
              const chat = await fetchChatById(id as string, token);
              
              // If the chat doesn't exist (was deleted), redirect to home
              if (!chat) {
                console.log("Chat not found or was deleted");
                router.push('/piper');
                return;
              }
              
              setChatData(chat);
              
              if (chat.files && chat.files.length > 0) {
                setUploadedFiles(chat.files);
                setChatLoaded(true);
                setActiveTab("chat");
              }
              
              // Load chat messages if they exist
              if (chat.messages && chat.messages.length > 0) {
                setMessages(chat.messages);
              } else {
                // Set default welcome message if no messages exist
                setMessages([{
                  role: 'assistant',
                  content: "I've processed your documents. What would you like to know about them?"
                }]);
              }
            } catch (error) {
              console.error("Chat not found:", error);
              // Redirect to the main chat page if the specific chat wasn't found
              router.push('/piper/chat');
            }
          }
        } catch (error) {
          console.error("Error loading chat:", error);
        }
      } else if (!chatLoadAttempted && id === 'new' && uploadedFiles.length > 0) {
        // For new chat with already uploaded files, add welcome message
        setChatLoadAttempted(true);
        setMessages([{
          role: 'assistant',
          content: "I've processed your documents. What would you like to know about them?"
        }]);
      }
    };
    
    loadExistingChat();
  }, [id, getToken, chatLoadAttempted, router]);


  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Send message function
  const sendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    
    if (!currentMessage.trim() || isSendingMessage) return;
    
    try {
      setIsSendingMessage(true);
      
      // Add user message to UI immediately
      const userMessage: Message = {
        role: 'user',
        content: currentMessage.trim()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setCurrentMessage('');
      
      const token = await getToken();
      if (!token || !userId) {
        throw new Error('Authentication required');
      }
      
      // If we don't have a chat ID yet, create a new chat
      let chatId = id as string;
      if (!chatId || chatId === 'new') {
        if (uploadedFiles.length === 0) {
          throw new Error('Please upload files before starting the chat');
        }
        
        const newChat = await createChat(userId, uploadedFiles, token);
        chatId = newChat.id;
        setChatData(newChat);
        
        // Navigate to the new chat URL
        router.push(`/chat/${chatId}`);
      }
      
      // Query the API with the user's message
      const response = await queryChatWithDocuments(
        userId,
        chatId,
        currentMessage.trim(),
        token
      );
      
      // Add the assistant's response to the UI
      if (response && response.answer) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.answer
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error in UI
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'Sorry, there was an error processing your request. Please try again.' 
        }
      ]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Function to handle upload button click when disabled
  const handleUploadButtonClick = () => {
    if (chatLoaded) {
      console.log("Setting tooltip to visible");
      setShowUploadTooltip(true);
      // Hide tooltip after longer duration for debugging if needed
      setTimeout(() => {
        console.log("Hiding tooltip");
        setShowUploadTooltip(false);
      }, debugTooltips ? 15000 : 3000); // 15 seconds in debug mode, 3 seconds normal
    } else {
      setActiveTab("upload");
    }
  };

  return (
    <>
      {/* Debug toggle (only in development) - Remove for production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-2 right-2 z-[9999]">
          <button 
            onClick={() => setDebugTooltips(!debugTooltips)}
            className="bg-black text-white p-1 text-xs rounded"
          >
            {debugTooltips ? "Debug Mode On" : "Debug Mode Off"}
          </button>
        </div>
      )}
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out forwards;
        }

        .message-bubble {
          min-width: 120px;
          max-width: 80%;
          word-break: break-word;
        }

        @media (min-width: 640px) {
          .message-bubble {
            max-width: 75%;
          }
        }
      `}</style>
      <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm overflow-hidden flex flex-col h-[83vh] max-w-5xl mx-auto">
        {/* Tab navigation */}
        <div
          className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "var(--scrollbar-thumb) var(--scrollbar-track)",
          }}
        >
          <div className="relative">
            <TooltipProvider delayDuration={200}>
              <Tooltip 
                onOpenChange={(open) => {
                  // Only close when transitioning from open to closed
                  if (!open) setShowUploadTooltip(false);
                }}
              >
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium flex items-center",
                      activeTab === "upload" ? "text-piper-blue dark:text-piper-cyan border-b-2 border-piper-blue dark:border-piper-cyan" : "text-muted-foreground",
                      chatLoaded && "opacity-60 cursor-not-allowed"
                    )}
                    onClick={handleUploadButtonClick}
                    disabled={chatLoaded}
                  >
                    <Upload className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                    <span className="whitespace-nowrap">Upload Documents</span>
                  </button>
                </TooltipTrigger>
                {/* Only render tooltip content when there are already files loaded */}
                {chatLoaded && (
                  <TooltipContent 
                    side="bottom" 
                    align="start" 
                    sideOffset={5} 
                    className={`z-[1000] p-2 text-xs ${
                      debugTooltips 
                        ? "bg-red-500 text-white border-2 border-white" 
                        : "bg-white dark:bg-gray-900 text-foreground border border-piper-blue dark:border-piper-cyan shadow-sm"
                    }`}
                  >
                    Files are already uploaded. You can't upload again in this session.
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            {/* Fallback tooltip for debugging purposes */}
            {debugTooltips && chatLoaded && (
              <div className="absolute top-full left-0 mt-2 p-2 bg-red-600 text-white text-sm rounded shadow-lg z-[9999] border-2 border-white">
                FALLBACK TOOLTIP: Files are already uploaded. You can't upload again in this session.
              </div>
            )}
          </div>
          
          <button
            className={cn(
              "px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium flex items-center",
              activeTab === "chat" ? "text-piper-blue dark:text-piper-cyan border-b-2 border-piper-blue dark:border-piper-cyan" : "text-muted-foreground",
            )}
            onClick={() => setActiveTab("chat")}
          >
            <MessageCircle className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
            <span className="whitespace-nowrap">Ask Questions</span>
          </button>
          <button
            className={cn(
              "px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium flex items-center",
              activeTab === "quiz" ? "text-piper-blue dark:text-piper-cyan border-b-2 border-piper-blue dark:border-piper-cyan" : "text-muted-foreground",
            )}
            onClick={() => setActiveTab("quiz")}
          >
            <CheckSquare className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
            <span className="whitespace-nowrap">Generate Quiz</span>
          </button>
        </div>

        {/* App content */}
        <div className="flex-1 overflow-auto">
          {/* Upload tab content */}
          

          {/* Chat tab content - show uploaded files info when chat is loaded */}
          {activeTab === "chat" && (
            <div className="flex flex-col h-full">
              {chatLoaded && uploadedFiles.length > 0 && (
                <div className="bg-accent/50 p-2 flex items-center justify-between border-b">
                  <div className="flex items-center text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    <span>
                      {uploadedFiles.length} {uploadedFiles.length === 1 ? 'file' : 'files'} uploaded: 
                      {uploadedFiles.map((file, index) => (
                        <span key={file.fileKey} className="ml-1 font-medium">
                          {file.fileName}{index < uploadedFiles.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </span>
                    </div>
                  </div>
              )}
              
              {/* Dynamic chat content */}
              <div className="flex-1 overflow-auto p-3 sm:p-6 space-y-6 sm:space-y-8 max-w-4xl mx-auto">

                {messages.map((message, index) => (
                  message.role === "assistant" ? (
                    // AI message
                    <div key={index} className="flex items-start space-x-3 sm:space-x-4 animate-fade-in">
                        <div className="w-8 h-8 rounded-full bg-piper-blue dark:bg-piper-cyan flex items-center justify-center flex-shrink-0">
                            <Image
                              src="/piper-mascot.svg"
                              alt="logo"
                              width={24}
                              height={24}
                              className="w-5 h-5"
                            />
                        </div>
                        <div className="message-bubble bg-accent rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
                          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                            {formatMessageText(message.content, uploadedFiles)}
                          </p>
                        </div>
                    </div>
                  ) : (
                    // User message
                    <div key={index} className="flex items-start justify-end space-x-3 sm:space-x-4 ml-auto animate-fade-in">
                      <div className="message-bubble bg-piper-blue dark:bg-piper-cyan dark:text-piper-darkblue text-primary-foreground rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                          {formatMessageText(message.content, uploadedFiles)}
                        </p>
                       
                      </div>
                      <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {user?.imageUrl ? 
                          <Image alt="user"
                          width={36}
                          height={36}
                            src={user.imageUrl} className="w-full h-full object-cover" /> :
                        <User className="h-4 w-4 sm:h-5 sm:w-5" />
                        }
                      </div>
                    </div>
                  )
                ))}

                {/* Loading indicator while sending message */}
                {isSendingMessage && (
                  <div className="flex items-start space-x-3 sm:space-x-4 animate-fade-in">
                    <div className="w-9 h-9 rounded-full bg-piper-blue dark:bg-piper-cyan flex items-center justify-center flex-shrink-0">
                        <Image
                          src="/piper-mascot.svg"
                          alt="logo"
                          width={24}
                          height={24}
                          className="w-5 h-5"
                        />
                    </div>
                    <div className="message-bubble bg-accent rounded-2xl p-4 shadow-sm min-w-[120px]">
                      <div className="flex items-center">
                        <div className="flex space-x-1">
                          <span className="w-2 h-2 rounded-full bg-piper-blue dark:bg-piper-cyan animate-bounce" style={{animationDelay: '0ms'}}></span>
                          <span className="w-2 h-2 rounded-full bg-piper-blue dark:bg-piper-cyan animate-bounce" style={{animationDelay: '150ms'}}></span>
                          <span className="w-2 h-2 rounded-full bg-piper-blue dark:bg-piper-cyan animate-bounce" style={{animationDelay: '300ms'}}></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Element to scroll to when new messages arrive */}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Chat input */}
              <div className="border-t p-2 sm:p-4">
                <form onSubmit={sendMessage} className="max-w-[85%] sm:max-w-[75%] mx-auto flex items-center bg-accent rounded-lg px-3 sm:px-4 py-1 sm:py-2">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Ask a question about your documents..."
                    className="flex-1 bg-transparent border-0 focus:ring-0 text-xs sm:text-sm outline-none"
                    disabled={isSendingMessage || !chatLoaded && uploadedFiles.length === 0}
                  />
                  <button 
                    type="submit"
                    className={cn(
                      "ml-1 sm:ml-2 rounded-full p-1.5 sm:p-2 text-primary-foreground flex items-center justify-center",
                      isSendingMessage || !chatLoaded && uploadedFiles.length === 0 
                        ? "bg-piper-blue/20 dark:bg-piper-cyan/20  cursor-not-allowed" 
                        : "bg-piper-blue dark:bg-piper-cyan hover:bg-piper-blue/90 dark:hover:bg-piper-cyan/90"
                    )}
                    disabled={isSendingMessage || !chatLoaded && uploadedFiles.length === 0}
                  >
                    {isSendingMessage ? (
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    ) : (
                      <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Quiz tab content - render PiperQuiz component */}
          {activeTab === "quiz" && <PiperQuiz uploadedFiles={uploadedFiles} chatId={id as string} />}
        </div>
      </div>
    </>
  )
}

