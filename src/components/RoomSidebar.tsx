'use client';

import React from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatTimestamp } from '@/lib/chatUtils';

export function RoomSidebar() {
  const { state, switchRoom } = useChat();
  const { state: authState, logout } = useAuth();

  const handleRoomSwitch = (roomId: string) => {
    if (roomId !== state.activeRoomId) {
      switchRoom(roomId);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3 mb-3">
          {authState.user && (
            <>
              <Avatar className="w-10 h-10">
                <AvatarFallback className={`${authState.user.avatar} text-white font-medium`}>
                  {authState.user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {authState.user.username}
                </p>
                <p className="text-sm text-green-600 capitalize">
                  {authState.user.status}
                </p>
              </div>
            </>
          )}
        </div>
        
        <Button
          onClick={logout}
          variant="outline"
          size="sm"
          className="w-full text-gray-600 hover:text-gray-800"
        >
          Sign Out
        </Button>
      </div>

      {/* Rooms List */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-1">Chat Rooms</h2>
          <p className="text-sm text-gray-600">
            {state.rooms.length} room{state.rooms.length !== 1 ? 's' : ''} available
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {state.rooms.map(room => {
              const isActive = room.id === state.activeRoomId;
              const hasUnreadMessages = room.messageCount > 0 && !isActive;
              const onlineCount = room.participants.filter(p => p.status === 'online').length;
              const latestMessage = room.messages[room.messages.length - 1];

              return (
                <button
                  key={room.id}
                  onClick={() => handleRoomSwitch(room.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 border border-blue-200 text-blue-900'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium truncate">
                      #{room.name.toLowerCase()}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {onlineCount > 0 && (
                        <Badge
                          variant={isActive ? "default" : "secondary"}
                          className="text-xs px-1.5 py-0"
                        >
                          {onlineCount}
                        </Badge>
                      )}
                      {hasUnreadMessages && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 truncate mb-2">
                    {room.description}
                  </p>
                  
                  {latestMessage && (
                    <div className="text-xs text-gray-400">
                      <span className="font-medium">
                        {latestMessage.sender.username}:
                      </span>
                      <span className="ml-1 truncate">
                        {latestMessage.content.substring(0, 30)}
                        {latestMessage.content.length > 30 ? '...' : ''}
                      </span>
                      <div className="mt-1 text-right">
                        {formatTimestamp(latestMessage.timestamp)}
                      </div>
                    </div>
                  )}
                  
                  {!latestMessage && (
                    <div className="text-xs text-gray-400">
                      No messages yet
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Connection Status */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              state.connectionStatus === 'connected' ? 'bg-green-500' :
              state.connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-xs text-gray-600 capitalize">
              {state.connectionStatus}
            </span>
          </div>
          
          <div className="text-xs text-gray-500">
            ChatApp
          </div>
        </div>
      </div>
    </div>
  );
}