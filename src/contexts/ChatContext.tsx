'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ChatState, ChatRoom, Message, User } from '@/types/chat';
import { useAuth } from './AuthContext';
import {
  createDefaultRooms,
  createMockUsers,
  createMessage,
  createSystemMessage,
  saveMessagesToStorage,
  loadMessagesFromStorage,
  getRandomMockResponse,
} from '@/lib/chatUtils';

interface ChatContextType {
  state: ChatState;
  sendMessage: (content: string) => void;
  switchRoom: (roomId: string) => void;
  setTyping: (isTyping: boolean) => void;
}

type ChatAction =
  | { type: 'INITIALIZE_CHAT'; payload: { rooms: ChatRoom[]; users: User[] } }
  | { type: 'SWITCH_ROOM'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_TYPING'; payload: { userId: string; isTyping: boolean } }
  | { type: 'ADD_USER_TO_ROOM'; payload: { user: User; roomId: string } }
  | { type: 'UPDATE_USER_STATUS'; payload: { userId: string; status: User['status'] } }
  | { type: 'SET_CONNECTION_STATUS'; payload: ChatState['connectionStatus'] };

const ChatContext = createContext<ChatContextType | undefined>(undefined);

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'INITIALIZE_CHAT':
      return {
        ...state,
        rooms: action.payload.rooms,
        users: action.payload.users,
        activeRoomId: action.payload.rooms[0]?.id || null,
        connectionStatus: 'connected',
      };

    case 'SWITCH_ROOM':
      return {
        ...state,
        activeRoomId: action.payload,
      };

    case 'ADD_MESSAGE':
      return {
        ...state,
        rooms: state.rooms.map(room =>
          room.id === action.payload.roomId
            ? {
                ...room,
                messages: [...room.messages, action.payload],
                lastActivity: action.payload.timestamp,
                messageCount: room.messageCount + 1,
              }
            : room
        ),
      };

    case 'SET_TYPING':
      return {
        ...state,
        isTyping: {
          ...state.isTyping,
          [action.payload.userId]: action.payload.isTyping,
        },
      };

    case 'ADD_USER_TO_ROOM':
      return {
        ...state,
        rooms: state.rooms.map(room =>
          room.id === action.payload.roomId
            ? {
                ...room,
                participants: room.participants.some(p => p.id === action.payload.user.id)
                  ? room.participants
                  : [...room.participants, action.payload.user],
              }
            : room
        ),
        users: state.users.some(u => u.id === action.payload.user.id)
          ? state.users
          : [...state.users, action.payload.user],
      };

    case 'UPDATE_USER_STATUS':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.userId
            ? { ...user, status: action.payload.status }
            : user
        ),
        rooms: state.rooms.map(room => ({
          ...room,
          participants: room.participants.map(user =>
            user.id === action.payload.userId
              ? { ...user, status: action.payload.status }
              : user
          ),
        })),
      };

    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        connectionStatus: action.payload,
      };

    default:
      return state;
  }
}

const initialState: ChatState = {
  rooms: [],
  activeRoomId: null,
  users: [],
  isTyping: {},
  connectionStatus: 'connecting',
};

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { state: authState } = useAuth();

  // Initialize chat when user is authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      const rooms = createDefaultRooms();
      const mockUsers = createMockUsers();
      const savedMessages = loadMessagesFromStorage();

      // Restore messages to rooms
      const roomsWithMessages = rooms.map(room => ({
        ...room,
        messages: savedMessages[room.id] || [],
        messageCount: (savedMessages[room.id] || []).length,
        participants: [authState.user!, ...mockUsers.filter(() => Math.random() > 0.5)],
      }));

      dispatch({
        type: 'INITIALIZE_CHAT',
        payload: { rooms: roomsWithMessages, users: [authState.user!, ...mockUsers] },
      });

      // Add welcome message for new users if no saved messages
      if (!savedMessages.general || savedMessages.general.length === 0) {
        setTimeout(() => {
          const welcomeMessage = createSystemMessage(
            `Welcome ${authState.user!.username}! 👋 Feel free to start chatting.`,
            'general'
          );
          dispatch({ type: 'ADD_MESSAGE', payload: welcomeMessage });
        }, 1000);
      }
    }
  }, [authState.isAuthenticated, authState.user]);

  // Save messages to storage whenever messages change
  useEffect(() => {
    if (state.rooms.length > 0) {
      const messagesToSave: { [roomId: string]: Message[] } = {};
      state.rooms.forEach(room => {
        messagesToSave[room.id] = room.messages;
      });
      saveMessagesToStorage(messagesToSave);
    }
  }, [state.rooms]);

  // Simulate random messages from other users
  useEffect(() => {
    if (!authState.isAuthenticated || state.rooms.length === 0) return;

    const interval = setInterval(() => {
      // Random chance to send a message
      if (Math.random() < 0.3) {
        const activeUsers = state.users.filter(u => u.status === 'online' && u.id !== authState.user?.id);
        const randomUser = activeUsers[Math.floor(Math.random() * activeUsers.length)];
        const randomRoom = state.rooms[Math.floor(Math.random() * state.rooms.length)];

        if (randomUser && randomRoom) {
          // Show typing indicator first
          dispatch({ type: 'SET_TYPING', payload: { userId: randomUser.id, isTyping: true } });

          setTimeout(() => {
            // Remove typing indicator and send message
            dispatch({ type: 'SET_TYPING', payload: { userId: randomUser.id, isTyping: false } });
            
            const messageContent = getRandomMockResponse(randomRoom.id);
            const message = createMessage(messageContent, randomUser, randomRoom.id);
            dispatch({ type: 'ADD_MESSAGE', payload: message });
          }, 1000 + Math.random() * 2000); // 1-3 second typing delay
        }
      }
    }, 10000 + Math.random() * 20000); // 10-30 seconds between messages

    return () => clearInterval(interval);
  }, [authState.isAuthenticated, state.rooms, state.users, authState.user]);

  const sendMessage = (content: string) => {
    if (!authState.user || !state.activeRoomId || !content.trim()) return;

    const message = createMessage(content, authState.user, state.activeRoomId);
    dispatch({ type: 'ADD_MESSAGE', payload: message });

    // Simulate user getting added to room if not already there
    dispatch({
      type: 'ADD_USER_TO_ROOM',
      payload: { user: authState.user, roomId: state.activeRoomId },
    });
  };

  const switchRoom = (roomId: string) => {
    dispatch({ type: 'SWITCH_ROOM', payload: roomId });
  };

  const setTyping = (isTyping: boolean) => {
    if (!authState.user) return;
    dispatch({ type: 'SET_TYPING', payload: { userId: authState.user.id, isTyping } });
  };

  const contextValue: ChatContextType = {
    state,
    sendMessage,
    switchRoom,
    setTyping,
  };

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}