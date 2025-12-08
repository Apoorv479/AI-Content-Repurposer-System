import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { IconButton } from '../common/IconButton.jsx';
import { FileDropzone } from '../common/FileDropzone.jsx';
import { startProcess } from '../../api/jobs.js';
import { useChatStore } from '../../state/chatStore.jsx';

// YouTube URL regex
const YOUTUBE_URL_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

/**
 * Detect mode from input
 */
function detectMode(text, hasFile) {
  if (hasFile) return 'file';
  if (YOUTUBE_URL_REGEX.test(text)) return 'link';
  return 'text';
}

/**
 * @param {Object} props
 * @param {() => void} [props.onSend]
 */
export function ChatInput({ onSend }) {
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef(null);
  const {
    currentChatId,
    createNewChat,
    addUserMessage,
    addAssistantPlaceholderMessage,
    updateAssistantMessageStatus,
  } = useChatStore();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleFileSelect = (files) => {
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      // Clear text input when file is selected
      setInput('');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSend = async () => {
    const text = input.trim();
    const hasFile = selectedFile !== null;
    
    if (!text && !hasFile) {
      return;
    }

    let chatId = currentChatId;
    if (!chatId) {
      chatId = createNewChat();
      // Wait a bit for chat to be created
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!chatId) return;

    const mode = detectMode(text, hasFile);
    setIsSending(true);

    try {
      // Add user message
      const userMessage = {
        userInput: text || selectedFile?.name || '',
        mode,
        fileName: selectedFile?.name,
      };
      addUserMessage(chatId, userMessage);

      // Add assistant placeholder immediately (before API call) so tabs show right away
      const tempJobId = `temp-${Date.now()}`;
      const placeholder = addAssistantPlaceholderMessage(chatId, {
        status: 'processing',
        progress: 0,
        activeVariant: 'blog',
        jobId: tempJobId,
      });
      const placeholderJobId = placeholder?.jobId || tempJobId;

      // Prepare payload
      const payload = {
        mode,
        input: mode === 'link' || mode === 'text' ? text : undefined,
        file: mode === 'file' ? selectedFile : undefined,
        options: {
          target_formats: ['blog', 'linkedin', 'thread', 'captions', 'seo_keywords'],
        },
      };

      // Call API
      try {
        const response = await startProcess(payload);
        const jobId = response.job_id;

        // Update assistant message with the real jobId using the temporary placeholder id
        updateAssistantMessageStatus(chatId, placeholderJobId, {
          jobId,
          status: 'processing',
          progress: 0,
        });
      } catch (apiError) {
        console.error('Failed to start process:', apiError);
        // Update assistant message to failed status (find by empty jobId)
        updateAssistantMessageStatus(chatId, placeholderJobId, {
          status: 'failed',
        });
      }

      // Clear input
      setInput('');
      setSelectedFile(null);

      if (onSend) {
        onSend();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // If we haven't created the assistant message yet, create it now with failed status
      // But actually, we already created it above, so we just need to update it
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = (input.trim().length > 0 || selectedFile !== null) && !isSending;

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {selectedFile && (
          <div className="mb-2 flex items-center gap-2 bg-slate-800 rounded-lg p-2">
            <span className="text-sm text-slate-300 flex-1 truncate">{selectedFile.name}</span>
            <button
              onClick={handleRemoveFile}
              className="text-slate-400 hover:text-slate-200 text-sm"
              aria-label="Remove file"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex items-end gap-3 rounded-2xl px-4 py-3 bg-slate-900 border border-indigo-500/60 shadow-[0_0_0_1px_rgba(129,140,248,0.5)]">
          <FileDropzone
            onFilesSelected={handleFileSelect}
            accept=".pdf,.docx,.doc,.mp3,.mp4,.wav,.m4a,.mov"
            className="flex-shrink-0"
          />
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste a YouTube link, some text, or upload a PDF/DOCX to repurpose it"
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 resize-none outline-none min-h-[24px] max-h-[200px]"
            rows={1}
            disabled={isSending}
          />
          <IconButton
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
            className="flex-shrink-0"
          >
            <Send size={20} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

