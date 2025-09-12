'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function MessageInput() {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, setTyping } = useChat();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  // Handle typing indicators
  useEffect(() => {
    let typingTimeout: ReturnType<typeof setTimeout>;

    if (message.trim() && !isComposing) {
      setTyping(true);
      
      typingTimeout = setTimeout(() => {
        setTyping(false);
      }, 3000);
    } else if (!message.trim()) {
      setTyping(false);
    }

    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [message, isComposing, setTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message.trim());
      setMessage('');
      setTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow new line with Shift+Enter
        return;
      } else {
        // Send message with Enter
        e.preventDefault();
        handleSubmit(e);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            className="min-h-[40px] max-h-[120px] resize-none pr-4 py-2"
            rows={1}
          />
        </div>
        
        <Button
          type="submit"
          disabled={!message.trim()}
          size="sm"
          className="px-6 py-2 self-end"
        >
          Send
        </Button>
      </form>

      <div className="mt-2 text-xs text-gray-500 flex justify-between items-center">
        <span>
          Press Enter to send • Shift+Enter for new line
        </span>
        <span className="text-right">
          {message.length > 0 && `${message.length} characters`}
        </span>
      </div>
    </div>
  );
}