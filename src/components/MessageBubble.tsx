'use client';

import React from 'react';
import { Message } from '@/types/chat';
import { formatTime } from '@/lib/chatUtils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
}

export function MessageBubble({ message, isOwn, showAvatar = true }: MessageBubbleProps) {
  const { sender, content, timestamp, type } = message;

  if (type === 'system') {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full max-w-md text-center">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start space-x-3 mb-4 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {showAvatar && !isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className={`${sender.avatar} text-white text-sm font-medium`}>
            {sender.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-xs sm:max-w-md`}>
        {!isOwn && showAvatar && (
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-700">{sender.username}</span>
            <div className={`w-2 h-2 rounded-full ${
              sender.status === 'online' ? 'bg-green-500' :
              sender.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
            }`} />
          </div>
        )}
        
        <div
          className={`px-4 py-2 rounded-2xl shadow-sm relative group ${
            isOwn
              ? 'bg-blue-500 text-white rounded-br-md'
              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
          
          <div className={`absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
            isOwn ? '-left-16' : '-right-16'
          } top-1/2 -translate-y-1/2`}>
            <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {formatTime(timestamp)}
            </div>
          </div>
        </div>
        
        {isOwn && showAvatar && (
          <Avatar className="w-8 h-8 flex-shrink-0 ml-3">
            <AvatarFallback className={`${sender.avatar} text-white text-sm font-medium`}>
              {sender.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}