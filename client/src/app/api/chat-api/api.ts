import { Message } from "@/components/PiperChat";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create a new chat
export const createChat = async (userId: string, files: { fileName: string, fileUrl: string, fileKey: string }[], token: string) => {
  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId, files })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create chat');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

// Fetch chat by ID
export const fetchChatById = async (chatId: string, token: string) => {
  try {
    const response = await fetch(`${API_URL}/api/chat/${chatId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch chat');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching chat:', error);
    throw error;
  }
};

// Add message to chat
export const addMessageToChat = async (chatId: string, message: Message, token: string) => {
  try {
    const response = await fetch(`${API_URL}/api/chat/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        role: message.role,
        content: message.content
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add message to chat');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding message to chat:', error);
    throw error;
  }
};

// Query chat with documents
export const queryChatWithDocuments = async (userId: string, chatId: string, query: string, token: string) => {
  try {
    const response = await fetch(`${API_URL}/api/chat/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId,
        chatId,
        query
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to query documents');
    }

    return await response.json();
  } catch (error) {
    console.error('Error querying documents:', error);
    throw error;
  }
};

// Get chat history
export const fetchChatHistory = async (token: string) => {
  try {
    const response = await fetch(`${API_URL}/api/chat/history`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to load chat history');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching chat history:', error);
      throw new Error('Failed to load chat history');
  }
};


// Delete chat
export const deleteChat = async (chatId: string, token: string) => {
  try {
    const response = await fetch(`${API_URL}/api/chat/${chatId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete chat');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw error;
  }
};

