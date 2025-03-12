'use client'
import { useAuth } from '@clerk/nextjs';
import ChatMenu from './ChatMenu';

interface ChatItemProps {
  chat: {
    id: string;
    title: string;
    // other chat properties
  };
  onDelete: () => void;
}

export const  ChatItem: React.FC<ChatItemProps> = async({ chat, onDelete }) => {
  const {  getToken } = useAuth();
    const token = await getToken();

    if(!token){
        throw new Error('Token not found');
    }
  return (
    <div className="flex items-center justify-between py-2 px-4 border-b">
      <div className="flex-1">
        <h3 className="text-lg font-medium">{chat.title}</h3>
        {/* other chat information */}
      </div>
      
      <ChatMenu 
        chatId={chat.id} 
        token={token} 
        onDeleteSuccess={onDelete}
      />
    </div>
  );
};

export default ChatItem;
