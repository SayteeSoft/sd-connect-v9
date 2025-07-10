
export type Profile = {
  id: number;
  name: string;
  email: string;
  password?: string;
  age: number;
  location: string;
  imageUrl: string;
  role: 'baby' | 'daddy';
  online: boolean;
  hint: string;
  verified?: boolean;
  bio?: string;
  wants?: string[];
  interests?: string[];
  gallery?: string[];
  attributes?: {
    [key: string]: string;
  };
  metCount?: number;
  notMetCount?: number;
  votes: {
    voterId: number;
    choice: 'met' | 'notMet';
  }[];
};

export type Message = {
  id: number;
  senderId: number; // Corresponds to a Profile ID
  text: string;
  timestamp: string; // ISO string for simplicity
};

export type Conversation = {
  id: number;
  participant: Profile;
  messages: Message[];
  unreadCount: number;
};
