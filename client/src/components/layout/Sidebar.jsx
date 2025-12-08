import React, { useState } from 'react';
import { useChatStore } from '../../state/chatStore.jsx';
import { clsx } from 'clsx';
import { MessageSquare, MoreVertical, Plus } from 'lucide-react';

/**
 * Format relative time
 */
function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 */
export function Sidebar({ isOpen, onClose }) {
  const {
    chats,
    currentChatId,
    createNewChat,
    setCurrentChat,
    renameChat,
    deleteChat,
  } = useChatStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuChatId, setOpenMenuChatId] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const chatList = Object.values(chats).sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  const filteredChats = chatList.filter((chat) =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewChat = () => {
    createNewChat();
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleChatSelect = (chatId) => {
    setOpenMenuChatId(null);
    setCurrentChat(chatId);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleDelete = (chatId) => {
    deleteChat(chatId);
    setOpenMenuChatId(null);
  };

  const handleRename = (chat) => {
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
    setOpenMenuChatId(null);
  };

  function handleCommitRename() {
    const trimmed = editingTitle.trim();
    if (editingChatId && trimmed) {
      renameChat(editingChatId, trimmed);
    }
    setEditingChatId(null);
    setEditingTitle('');
  }

  function handleCancelRename() {
    setEditingChatId(null);
    setEditingTitle('');
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Overlay to close kebab menus */}
      {openMenuChatId && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenMenuChatId(null)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed md:relative inset-y-0 left-0 z-50 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out',
          isOpen
            ? 'translate-x-0 w-64 md:w-64'
            : '-translate-x-full w-64 md:w-0 md:-translate-x-full md:opacity-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="text-indigo-500" size={24} />
              <h2 className="text-lg font-semibold text-slate-100">
               Recraft AI
              </h2>
            </div>
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition"
            >
              <Plus size={16} className="h-4 w-4" />
              New Chat
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Chat History
              </h3>
              <div className="space-y-1">
                {chatList.length === 0 ? (
                  <div className="text-sm text-slate-500 py-4 text-center">
                    No chats yet
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="text-sm text-slate-500 py-4 text-center">
                    No chats found
                  </div>
                ) : (
                  filteredChats.map((chat) => {
                    const isActive = chat.id === currentChatId;
                    return (
                      <div
                        key={chat.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleChatSelect(chat.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleChatSelect(chat.id);
                          }
                        }}
                        className={clsx(
                          'group w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 relative',
                          isActive
                            ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/40'
                            : 'text-slate-300 hover:bg-slate-800'
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          {editingChatId === chat.id ? (
                            <input
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              className="w-full bg-transparent text-sm font-medium text-slate-100 outline-none border border-slate-600 rounded px-2 py-1"
                              autoFocus
                              onFocus={(e) => e.target.select()}
                              onBlur={handleCommitRename}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCommitRename();
                                if (e.key === 'Escape') handleCancelRename();
                              }}
                            />
                          ) : (
                            <span className="truncate text-sm font-medium">
                              {chat.title}
                            </span>
                          )}
                          <div className="text-xs text-slate-500 mt-0.5">
                            {formatRelativeTime(chat.updatedAt)}
                          </div>
                        </div>
                        <div className="relative">
                          <button
                            type="button"
                            aria-label="Open chat actions"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuChatId((prev) =>
                                prev === chat.id ? null : chat.id
                              );
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {openMenuChatId === chat.id && (
                            <div className="absolute right-0 top-full mt-1 rounded-md bg-slate-900 border border-slate-700 shadow-lg py-1 text-sm text-slate-100 z-50 min-w-[140px]">
                              <button
                                type="button"
                                className="block w-full px-3 py-1.5 text-left hover:bg-slate-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRename(chat);
                                }}
                              >
                                Rename
                              </button>
                              <button
                                type="button"
                                className="block w-full px-3 py-1.5 text-left hover:bg-slate-800 text-red-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(chat.id);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-t border-slate-800">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chats"
              className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 border border-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </aside>
    </>
  );
}


