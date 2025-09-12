'use client';

import React from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatTimestamp } from '@/lib/chatUtils';
import { User } from '@/types/chat';

export function UserList() {
  const { state } = useChat();
  const currentRoom = state.rooms.find(room => room.id === state.activeRoomId);
  
  if (!currentRoom) return null;

  const onlineUsers = currentRoom.participants.filter(user => user.status === 'online');
  const awayUsers = currentRoom.participants.filter(user => user.status === 'away');
  const offlineUsers = currentRoom.participants.filter(user => user.status === 'offline');

  const UserItem = ({ user }: { user: User }) => {
    const isTyping = state.isTyping[user.id];
    
    return (
      <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="relative">
          <Avatar className="w-8 h-8">
            <AvatarFallback className={`${user.avatar} text-white text-sm font-medium`}>
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
            user.status === 'online' ? 'bg-green-500' :
            user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
          }`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.username}
            </p>
            {user.status === 'online' && (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                Online
              </Badge>
            )}
          </div>
          
          <p className="text-xs text-gray-500">
            {isTyping ? (
              <span className="text-blue-600 animate-pulse">typing...</span>
            ) : user.status === 'offline' ? (
              `Last seen ${formatTimestamp(user.lastSeen)}`
            ) : user.status === 'away' ? (
              'Away'
            ) : (
              'Active now'
            )}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-64 bg-gray-50 border-l border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-1">
          Room Members
        </h3>
        <p className="text-sm text-gray-600">
          {currentRoom.participants.length} member{currentRoom.participants.length !== 1 ? 's' : ''}
        </p>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {onlineUsers.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2 px-2">
                Online — {onlineUsers.length}
              </h4>
              {onlineUsers.map(user => (
                <UserItem key={user.id} user={user} />
              ))}
            </div>
          )}

          {awayUsers.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-yellow-600 uppercase tracking-wide mb-2 px-2">
                Away — {awayUsers.length}
              </h4>
              {awayUsers.map(user => (
                <UserItem key={user.id} user={user} />
              ))}
            </div>
          )}

          {offlineUsers.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                Offline — {offlineUsers.length}
              </h4>
              {offlineUsers.map(user => (
                <UserItem key={user.id} user={user} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          </div>
          <span className="text-xs text-gray-600">
            Online • Away • Offline
          </span>
        </div>
      </div>
    </div>
  );
}