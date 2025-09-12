export interface User {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
  joinedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  sender: User;
  timestamp: Date;
  roomId: string;
  type: 'text' | 'system';
  reactions?: Reaction[];
}

export interface Reaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  participants: User[];
  messages: Message[];
  isActive: boolean;
  lastActivity: Date;
  messageCount: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ChatState {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  users: User[];
  isTyping: { [userId: string]: boolean };
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

export interface LoginFormData {
  username: string;
  avatar?: string;
}

export interface MessageFormData {
  content: string;
}

export interface TypingIndicator {
  userId: string;
  username: string;
  roomId: string;
  timestamp: Date;
}