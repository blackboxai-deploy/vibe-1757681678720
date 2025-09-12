'use client';

import React, { useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { RoomSidebar } from './RoomSidebar';
import { UserList } from './UserList';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export function ChatRoom() {
  const { state } = useChat();
  const { state: authState } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentRoom = state.rooms.find(room => room.id === state.activeRoomId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentRoom?.messages]);

  if (!currentRoom || !authState.user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat room...</p>
        </div>
      </div>
    );
  }

  const typingUsers = Object.keys(state.isTyping)
    .filter(userId => state.isTyping[userId] && userId !== authState.user?.id)
    .map(userId => state.users.find(user => user.id === userId))
    .filter(Boolean);

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Sidebar - Rooms */}
      <RoomSidebar />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                #{currentRoom.name.toLowerCase()}
              </h1>
              <p className="text-sm text-gray-600">{currentRoom.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {currentRoom.participants.filter(p => p.status === 'online').length} online
              </span>
            </div>
            
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {currentRoom.messageCount} messages
            </Badge>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-1">
                {currentRoom.messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                        <span className="text-2xl">💬</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Welcome to #{currentRoom.name.toLowerCase()}!
                    </h3>
                    <p className="text-gray-600 max-w-sm mx-auto">
                      {currentRoom.description}
                    </p>
                    <p className="text-sm text-gray-500 mt-4">
                      Start the conversation by sending your first message below.
                    </p>
                  </div>
                ) : (
                  currentRoom.messages.map((message, index) => {
                    const isOwn = message.sender.id === authState.user?.id;
                    const prevMessage = currentRoom.messages[index - 1];
                    const showAvatar = !prevMessage || 
                      prevMessage.sender.id !== message.sender.id || 
                      (message.timestamp.getTime() - prevMessage.timestamp.getTime()) > 300000; // 5 minutes

                    return (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwn={isOwn}
                        showAvatar={showAvatar}
                      />
                    );
                  })
                )}
                
                {/* Typing Indicators */}
                {typingUsers.length > 0 && (
                  <div className="flex items-center space-x-2 px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div 
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                        style={{ animationDelay: '0.1s' as const }}
                      ></div>
                      <div 
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                        style={{ animationDelay: '0.2s' as const }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {typingUsers.length === 1 
                        ? `${typingUsers[0]?.username} is typing...`
                        : `${typingUsers.length} people are typing...`
                      }
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <MessageInput />
          </div>

          {/* Right Sidebar - Users (Hidden on mobile) */}
          <div className="hidden lg:block">
            <UserList />
          </div>
        </div>
      </div>
    </div>
  );
}