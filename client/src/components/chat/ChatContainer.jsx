import React, { useEffect, useRef } from 'react';
import { ChatHeader } from './ChatHeader.jsx';
import { MessageList } from './MessageList.jsx';
import { ChatInput } from './ChatInput.jsx';
import { useChatStore } from '../../state/chatStore.jsx';
import { getJobStatus, getJobResult } from '../../api/jobs.js';

export function ChatContainer() {
  const { currentChat, currentChatId, updateAssistantMessageStatus } = useChatStore();
  const messages = currentChat?.messages || [];
  const pollingRefs = useRef({});

  // Poll for all processing jobs
  useEffect(() => {
    const processingMessages = messages.filter(
      (msg) =>
        msg.role === 'assistant' &&
        msg.status === 'processing' &&
        msg.jobId &&
        !msg.jobId.startsWith('temp-')
    );

    // Clean up polling for jobs that are no longer processing
    Object.keys(pollingRefs.current).forEach((jobId) => {
      const stillProcessing = processingMessages.some((msg) => msg.jobId === jobId);
      if (!stillProcessing && pollingRefs.current[jobId]) {
        clearInterval(pollingRefs.current[jobId]);
        delete pollingRefs.current[jobId];
      }
    });

    // Start polling for new processing jobs
    processingMessages.forEach((msg) => {
      const { jobId } = msg;
      if (!pollingRefs.current[jobId] && currentChatId) {
        const poll = async () => {
          try {
            const statusResponse = await getJobStatus(jobId);
            const { status, progress, current_step } = statusResponse;

            updateAssistantMessageStatus(currentChatId, jobId, {
              status,
              progress: progress || 0,
              currentStep: current_step,
            });

            if (status === 'done') {
              // Fetch result
              try {
                const resultResponse = await getJobResult(jobId);
                updateAssistantMessageStatus(currentChatId, jobId, {
                  status: 'done',
                  result: resultResponse.result,
                  activeVariant: 'blog',
                });
              } catch (error) {
                console.error('Failed to fetch job result:', error);
                updateAssistantMessageStatus(currentChatId, jobId, {
                  status: 'failed',
                });
              }
              // Stop polling
              if (pollingRefs.current[jobId]) {
                clearInterval(pollingRefs.current[jobId]);
                delete pollingRefs.current[jobId];
              }
            } else if (status === 'failed') {
              // Stop polling on failure
              if (pollingRefs.current[jobId]) {
                clearInterval(pollingRefs.current[jobId]);
                delete pollingRefs.current[jobId];
              }
            }
          } catch (error) {
            console.error('Failed to poll job status:', error);
            // On error, stop polling
            if (pollingRefs.current[jobId]) {
              clearInterval(pollingRefs.current[jobId]);
              delete pollingRefs.current[jobId];
            }
          }
        };

        // Poll immediately, then every 2 seconds
        poll();
        pollingRefs.current[jobId] = setInterval(poll, 2000);
      }
    });

    // Cleanup on unmount or when chat changes
    return () => {
      Object.values(pollingRefs.current).forEach((intervalId) => {
        clearInterval(intervalId);
      });
      pollingRefs.current = {};
    };
  }, [messages, currentChatId, updateAssistantMessageStatus]);

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-full">
      {!hasMessages ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl px-4">
            <ChatHeader />
            <div className="mt-8">
              <ChatInput />
            </div>
          </div>
        </div>
      ) : (
        <>
          <MessageList messages={messages} />
          <ChatInput />
        </>
      )}
    </div>
  );
}

