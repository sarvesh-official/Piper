'use client'
import { useState, useRef, useEffect } from 'react';
import { deleteChat } from '@/app/api/chat-api/api';
import { useRouter } from 'next/navigation';

interface ChatMenuProps {
  chatId: string;
  token: string;
  onDeleteSuccess?: () => void;
}

export const ChatMenu: React.FC<ChatMenuProps> = ({ chatId, token, onDeleteSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this chat?')) {
      try {
        await deleteChat(chatId, token);
        setIsOpen(false);
        if (onDeleteSuccess) {
          onDeleteSuccess();
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Failed to delete chat:', error);
        alert('Failed to delete chat. Please try again.');
      }
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100"
        aria-label="Chat options"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="2" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="14" r="1.5" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 bg-white shadow-lg rounded-md py-1 z-10 w-48 border border-gray-200">
          <button 
            onClick={handleDelete}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            Delete chat
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatMenu;
