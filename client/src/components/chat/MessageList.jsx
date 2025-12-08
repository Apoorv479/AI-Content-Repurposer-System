import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble.jsx';
import { useChatStore } from '../../state/chatStore.jsx';

/**
 * @param {Object} props
 * @param {Array} props.messages - Array of ChatMessage objects
 */
export function MessageList({ messages }) {
  const messagesEndRef = useRef(null);
  const { setActiveVariant, currentChatId } = useChatStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleVariantChange = (jobId, variant) => {
    if (currentChatId) {
      setActiveVariant(currentChatId, jobId, variant);
    }
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          onVariantChange={(variant) => handleVariantChange(message.jobId, variant)}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}


