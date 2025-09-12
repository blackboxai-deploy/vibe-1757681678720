import { User, Message, ChatRoom } from '@/types/chat';

export const MESSAGES_STORAGE_KEY = 'chat_app_messages';
export const ROOMS_STORAGE_KEY = 'chat_app_rooms';

export function generateMessageId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function createMessage(content: string, sender: User, roomId: string): Message {
  return {
    id: generateMessageId(),
    content: content.trim(),
    sender,
    timestamp: new Date(),
    roomId,
    type: 'text',
    reactions: [],
  };
}

export function createSystemMessage(content: string, roomId: string): Message {
  const systemUser: User = {
    id: 'system',
    username: 'System',
    avatar: 'bg-gray-500',
    status: 'online',
    lastSeen: new Date(),
    joinedAt: new Date(),
  };

  return {
    id: generateMessageId(),
    content,
    sender: systemUser,
    timestamp: new Date(),
    roomId,
    type: 'system',
    reactions: [],
  };
}

export function formatTimestamp(timestamp: Date): string {
  const now = new Date();
  const messageTime = new Date(timestamp);
  const diffInMs = now.getTime() - messageTime.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return messageTime.toLocaleDateString();
  }
}

export function formatTime(timestamp: Date): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function createDefaultRooms(): ChatRoom[] {
  const now = new Date();
  
  return [
    {
      id: 'general',
      name: 'General',
      description: 'General discussion for everyone',
      participants: [],
      messages: [],
      isActive: true,
      lastActivity: now,
      messageCount: 0,
    },
    {
      id: 'development',
      name: 'Development',
      description: 'Talk about coding, tech, and development',
      participants: [],
      messages: [],
      isActive: true,
      lastActivity: now,
      messageCount: 0,
    },
    {
      id: 'random',
      name: 'Random',
      description: 'Off-topic conversations and random chatter',
      participants: [],
      messages: [],
      isActive: true,
      lastActivity: now,
      messageCount: 0,
    },
  ];
}

export function createMockUsers(): User[] {
  const now = new Date();
  
  return [
    {
      id: 'user1',
      username: 'Alice',
      avatar: 'bg-purple-500',
      status: 'online',
      lastSeen: now,
      joinedAt: new Date(now.getTime() - 86400000), // 1 day ago
    },
    {
      id: 'user2',
      username: 'Bob',
      avatar: 'bg-blue-500',
      status: 'away',
      lastSeen: new Date(now.getTime() - 300000), // 5 minutes ago
      joinedAt: new Date(now.getTime() - 172800000), // 2 days ago
    },
    {
      id: 'user3',
      username: 'Charlie',
      avatar: 'bg-green-500',
      status: 'online',
      lastSeen: now,
      joinedAt: new Date(now.getTime() - 259200000), // 3 days ago
    },
    {
      id: 'user4',
      username: 'Diana',
      avatar: 'bg-pink-500',
      status: 'offline',
      lastSeen: new Date(now.getTime() - 3600000), // 1 hour ago
      joinedAt: new Date(now.getTime() - 432000000), // 5 days ago
    },
  ];
}

export function getRandomMockResponse(roomId: string): string {
  const responses = {
    general: [
      "Hey everyone! How's your day going?",
      "Anyone up for a coffee break? ☕",
      "Just finished a great book recommendation!",
      "The weather is amazing today! 🌞",
      "Hope everyone is having a productive day!",
      "Just wanted to say hi to the team! 👋",
    ],
    development: [
      "Just deployed a new feature! 🚀",
      "Has anyone tried the new React 19 features?",
      "Working on optimizing our build process",
      "Found a great new VS Code extension!",
      "Anyone familiar with Next.js 15?",
      "Just fixed a tricky bug in production! 🐛",
      "TypeScript strict mode is a game changer",
    ],
    random: [
      "Did you see that new movie trailer? 🎬",
      "Planning my weekend hiking trip! 🥾",
      "Just tried a new recipe and it's amazing!",
      "My cat decided to join the video call today 🐱",
      "Anyone else excited for the weekend?",
      "Just discovered a new coffee shop nearby ☕",
      "The sunset looks incredible today! 🌅",
    ],
  };

  const roomResponses = responses[roomId as keyof typeof responses] || responses.general;
  return roomResponses[Math.floor(Math.random() * roomResponses.length)];
}

export function saveMessagesToStorage(messages: { [roomId: string]: Message[] }): void {
  if (typeof window !== 'undefined') {
    const messagesToSave: { [roomId: string]: Message[] } = {};
    
    // Keep only last 100 messages per room
    Object.keys(messages).forEach(roomId => {
      messagesToSave[roomId] = messages[roomId].slice(-100);
    });
    
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messagesToSave));
  }
}

export function loadMessagesFromStorage(): { [roomId: string]: Message[] } {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (stored) {
      const messages = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      Object.keys(messages).forEach(roomId => {
        messages[roomId] = messages[roomId].map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          sender: {
            ...msg.sender,
            lastSeen: new Date(msg.sender.lastSeen),
            joinedAt: new Date(msg.sender.joinedAt),
          },
        }));
      });
      return messages;
    }
  } catch (error) {
    console.error('Error loading messages from storage:', error);
  }
  
  return {};
}