import { User } from '@/types/chat';

export const AUTH_STORAGE_KEY = 'chat_app_auth';
export const USER_STORAGE_KEY = 'chat_app_user';

export function generateUserId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function generateAvatar(username: string): string {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  const colorIndex = username.charCodeAt(0) % colors.length;
  return colors[colorIndex];
}

export function createUser(username: string): User {
  const now = new Date();
  return {
    id: generateUserId(),
    username: username.trim(),
    avatar: generateAvatar(username),
    status: 'online',
    lastSeen: now,
    joinedAt: now,
  };
}

export function saveUserToStorage(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');
  }
}

export function getUserFromStorage(): User | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const isAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    
    if (isAuth === 'true' && userData) {
      const user = JSON.parse(userData);
      // Update timestamps on load
      return {
        ...user,
        lastSeen: new Date(user.lastSeen),
        joinedAt: new Date(user.joinedAt),
        status: 'online'
      };
    }
  } catch (error) {
    console.error('Error loading user from storage:', error);
  }
  
  return null;
}

export function removeUserFromStorage(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function updateUserStatus(user: User, status: User['status']): User {
  const updatedUser = {
    ...user,
    status,
    lastSeen: status === 'offline' ? new Date() : user.lastSeen
  };
  
  if (typeof window !== 'undefined') {
    saveUserToStorage(updatedUser);
  }
  
  return updatedUser;
}

export function validateUsername(username: string): string | null {
  const trimmed = username.trim();
  
  if (!trimmed) {
    return 'Username is required';
  }
  
  if (trimmed.length < 2) {
    return 'Username must be at least 2 characters long';
  }
  
  if (trimmed.length > 20) {
    return 'Username must be less than 20 characters';
  }
  
  if (!/^[a-zA-Z0-9_\-\s]+$/.test(trimmed)) {
    return 'Username can only contain letters, numbers, spaces, hyphens, and underscores';
  }
  
  return null;
}