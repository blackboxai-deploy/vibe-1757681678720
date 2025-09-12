'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/LoginForm';
import { ChatRoom } from '@/components/ChatRoom';

export default function HomePage() {
  const { state } = useAuth();

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!state.isAuthenticated || !state.user) {
    return <LoginForm />;
  }

  return <ChatRoom />;
}