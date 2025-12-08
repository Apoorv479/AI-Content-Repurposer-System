import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { startProcess } from '../api/jobs.js';

const ChatContext = createContext(null);

/**
 * Generate a unique ID
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get title from first user message
 */
function getTitleFromMessage(message) {
  if (message.userInput) {
    const text = message.userInput.trim();
    if (text.length > 30) {
      return text.substring(0, 30) + '...';
    }
    return text;
  }
  return 'New chat';
}

/**
 * Load chats from localStorage
 */
function loadChatsFromStorage() {
  try {
    const stored = localStorage.getItem('content_ai_chats');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load chats from storage:', error);
  }
  return {};
}

/**
 * Save chats to localStorage
 */
function saveChatsToStorage(chats) {
  try {
    localStorage.setItem('content_ai_chats', JSON.stringify(chats));
  } catch (error) {
    console.error('Failed to save chats to storage:', error);
  }
}

export function ChatProvider({ children }) {
  const [chats, setChats] = useState(() => loadChatsFromStorage());
  const [currentChatId, setCurrentChatId] = useState(null);

  // Load current chat ID from storage on mount
  useEffect(() => {
    const storedChatId = localStorage.getItem('content_ai_current_chat_id');
    if (storedChatId && chats[storedChatId]) {
      setCurrentChatId(storedChatId);
    } else if (Object.keys(chats).length === 0) {
      // Create first chat if none exist
      createNewChat();
    } else {
      // Use first available chat
      const firstChatId = Object.keys(chats)[0];
      setCurrentChatId(firstChatId);
    }
  }, []);

  // Save chats to storage whenever they change
  useEffect(() => {
    saveChatsToStorage(chats);
  }, [chats]);

  // Save current chat ID to storage
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem('content_ai_current_chat_id', currentChatId);
    } else {
      localStorage.removeItem('content_ai_current_chat_id');
    }
  }, [currentChatId]);

  const createNewChat = useCallback(() => {
    const newChatId = generateId();
    const newChat = {
      id: newChatId,
      title: 'New chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };

    setChats((prev) => ({
      ...prev,
      [newChatId]: newChat,
    }));

    setCurrentChatId(newChatId);
    return newChatId;
  }, []);

  const setCurrentChat = useCallback((chatId) => {
    if (chats[chatId]) {
      setCurrentChatId(chatId);
    }
  }, [chats]);

  const addUserMessage = useCallback((chatId, message) => {
    setChats((prev) => {
      const chat = prev[chatId];
      if (!chat) return prev;

      const newMessage = {
        id: generateId(),
        jobId: '',
        createdAt: new Date().toISOString(),
        role: 'user',
        ...message,
      };

      const updatedChat = {
        ...chat,
        messages: [...chat.messages, newMessage],
        updatedAt: new Date().toISOString(),
        title: chat.messages.length === 0 ? getTitleFromMessage(newMessage) : chat.title,
      };

      return {
        ...prev,
        [chatId]: updatedChat,
      };
    });
  }, []);

  const addAssistantPlaceholderMessage = useCallback((chatId, message) => {
    let createdMessage = null;
    setChats((prev) => {
      const chat = prev[chatId];
      if (!chat) return prev;

      createdMessage = {
        id: generateId(),
        jobId: message.jobId || '',
        createdAt: new Date().toISOString(),
        role: 'assistant',
        status: 'pending',
        progress: 0,
        activeVariant: 'blog',
        ...message,
      };

      const updatedChat = {
        ...chat,
        messages: [...chat.messages, createdMessage],
        updatedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        [chatId]: updatedChat,
      };
    });
    // Returning the created placeholder helps follow-up updates (e.g., retry)
    // without having to search again.
    return createdMessage;
  }, []);

  const updateAssistantMessageStatus = useCallback((chatId, jobId, partialUpdate) => {
    setChats((prev) => {
      const chat = prev[chatId];
      if (!chat) return prev;

      const updatedMessages = chat.messages.map((msg) => {
        if (msg.jobId === jobId && msg.role === 'assistant') {
          return {
            ...msg,
            ...partialUpdate,
          };
        }
        return msg;
      });

      return {
        ...prev,
        [chatId]: {
          ...chat,
          messages: updatedMessages,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const setActiveVariant = useCallback((chatId, jobId, variant) => {
    setChats((prev) => {
      const chat = prev[chatId];
      if (!chat) return prev;

      const updatedMessages = chat.messages.map((msg) => {
        if (msg.jobId === jobId && msg.role === 'assistant') {
          return {
            ...msg,
            activeVariant: variant,
          };
        }
        return msg;
      });

      return {
        ...prev,
        [chatId]: {
          ...chat,
          messages: updatedMessages,
        },
      };
    });
  }, []);

  const renameChat = useCallback((chatId, newTitle) => {
    setChats((prev) => {
      const chat = prev[chatId];
      if (!chat) return prev;

      const updatedChat = {
        ...chat,
        title: newTitle,
        updatedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        [chatId]: updatedChat,
      };
    });
  }, []);

  const deleteChat = useCallback(
    (chatId) => {
      let nextChatId = null;

      setChats((prev) => {
        if (!prev[chatId]) return prev;

        const { [chatId]: _removed, ...remaining } = prev;
        const remainingList = Object.values(remaining).sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        nextChatId = remainingList[0]?.id || null;
        return remaining;
      });

      setCurrentChatId((prevId) => {
        if (prevId !== chatId) {
          return prevId;
        }

        if (nextChatId) {
          return nextChatId;
        }

        const newChatId = createNewChat();
        return newChatId;
      });
    },
    [createNewChat]
  );

  /**
   * Find the user message that immediately precedes the given assistant message.
   */
  const findPreviousUserMessage = useCallback((messages, assistantMessageId) => {
    const idx = messages.findIndex((msg) => msg.id === assistantMessageId);
    if (idx === -1) return null;
    for (let i = idx - 1; i >= 0; i -= 1) {
      if (messages[i].role === 'user') {
        return messages[i];
      }
    }
    return null;
  }, []);

  /**
   * Retry an assistant response by reusing the corresponding user message input.
   * Files are skipped because we don't have the original file reference to resend.
   */
  const retryAssistantMessage = useCallback(
    async (chatId, assistantMessageId) => {
      const chat = chats[chatId];
      if (!chat) return null;

      const userMessage = findPreviousUserMessage(chat.messages, assistantMessageId);
      if (!userMessage) {
        console.warn('No user message found for retry');
        return null;
      }

      if (userMessage.mode === 'file') {
        console.warn('Retry for file uploads is not supported without the original file.');
        return null;
      }

      const tempJobId = `temp-${generateId()}`;
      addAssistantPlaceholderMessage(chatId, {
        jobId: tempJobId,
        status: 'processing',
        progress: 0,
        activeVariant: 'blog',
      });

      const payload = {
        mode: userMessage.mode,
        input: userMessage.userInput,
        options: {
          target_formats: ['blog', 'linkedin', 'thread', 'captions', 'seo_keywords'],
        },
      };

      try {
        const response = await startProcess(payload);
        const jobId = response.job_id;

        updateAssistantMessageStatus(chatId, tempJobId, {
          jobId,
          status: 'processing',
          progress: 0,
        });

        return jobId;
      } catch (error) {
        console.error('Failed to retry process:', error);
        updateAssistantMessageStatus(chatId, tempJobId, {
          status: 'failed',
        });
        return null;
      }
    },
    [addAssistantPlaceholderMessage, chats, findPreviousUserMessage, updateAssistantMessageStatus]
  );

  const value = {
    chats,
    currentChatId,
    currentChat: currentChatId ? chats[currentChatId] : null,
    createNewChat,
    setCurrentChat,
    addUserMessage,
    addAssistantPlaceholderMessage,
    updateAssistantMessageStatus,
    setActiveVariant,
    renameChat,
    deleteChat,
    retryAssistantMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatStore() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatStore must be used within ChatProvider');
  }
  return context;
}


