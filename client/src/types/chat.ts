// Define Message type for chat
export type Message = {
    id?: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt?: string;
  };
  