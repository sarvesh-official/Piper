import axios from "axios";
import { API_URL } from "../file-upload/api";

// New function to create a chat after file upload
export const createChat = async (userId: string, files: any[], token: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/chat/create`, {
        userId,
        files
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw new Error('Failed to create chat');
    }
  };
  // New function to fetch chat history
  export const fetchChatHistory = async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/chat/history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw new Error('Failed to fetch chat history');
    }
  };
  
  // New function to fetch a specific chat
  export const fetchChatById = async (chatId: string, token: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/chat/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chat:', error);
      throw new Error('Failed to fetch chat');
    }
  };
  
  