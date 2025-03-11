import { useState } from "react"
import { ChatMessage } from "./ChatMessage"
import { ChatInput } from "./ChatInput"

export function ChatTab() {
  const [messages, setMessages] = useState([
    {
      type: "ai" as const,
      content: "I've processed your documents on machine learning. What would you like to know about neural networks or deep learning concepts?"
    },
    {
      type: "user" as const,
      content: "Can you explain the difference between CNN and RNN models in simple terms?"
    },
    {
      type: "ai" as const,
      content: "CNNs (Convolutional Neural Networks) are specialized for grid-like data such as images. They use filters to detect patterns like edges and textures, making them excellent for image recognition tasks.\n\nRNNs (Recurrent Neural Networks) are designed for sequential data like text or time series. They have a \"memory\" that allows them to consider previous inputs when processing the current input, making them good for language processing or speech recognition."
    }
  ])
  
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = (content: string) => {
    // Add user message
    setMessages(prev => [...prev, { type: "user", content }])
    
    // Simulate AI response (in a real app, this would be an API call)
    setIsLoading(true)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        type: "ai", 
        content: "This is a simulated response. In a real application, this would come from your backend API." 
      }])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        {messages.map((message, index) => (
          <ChatMessage key={index} type={message.type} content={message.content} />
        ))}
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  )
}
