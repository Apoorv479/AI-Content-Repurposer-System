import React from 'react';
import { Spinner } from '../common/Spinner.jsx';
import { ProgressBar } from '../common/ProgressBar.jsx';
import { VariantTabs } from './VariantTabs.jsx';
import { Button } from '../common/Button.jsx';
import { ThumbsUp, ThumbsDown, Copy, RotateCcw } from 'lucide-react';
import { sendFeedback } from '../../api/jobs.js';
import { useChatStore } from '../../state/chatStore.jsx';

async function copyTextToClipboard(text) {
  if (!text) return;

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch (error) {
    console.error('navigator.clipboard failed, falling back', error);
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  } catch (fallbackError) {
    console.error('Failed to copy text', fallbackError);
  }
}

function getResponseTextForCopy(message) {
  if (!message?.result) return '';

  switch (message.activeVariant) {
    case 'blog':
      return message.result.blog?.text || '';
    case 'linkedin':
      return message.result.linkedin?.text || '';
    case 'captions':
      return Array.isArray(message.result.captions)
        ? message.result.captions.join('\n')
        : '';
    case 'seo_keywords':
      return Array.isArray(message.result.seo_keywords)
        ? message.result.seo_keywords.join(', ')
        : '';
    case 'thread':
      return Array.isArray(message.result.thread?.tweets)
        ? message.result.thread.tweets.join('\n')
        : '';
    default:
      return '';
  }
}

/**
 * Render content based on active variant
 */
function renderContent(result, activeVariant) {
  // If no result data, show placeholder
  if (!result) {
    return (
      <p className="text-slate-400 text-sm italic">
        No content yet (backend not connected).
      </p>
    );
  }

  switch (activeVariant) {
    case 'blog':
      if (result.blog?.text) {
        return (
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-slate-100 leading-relaxed">
              {result.blog.text}
            </div>
            {result.blog.word_count && (
              <div className="text-xs text-slate-400 mt-2">
                {result.blog.word_count} words
              </div>
            )}
          </div>
        );
      }
      return (
        <p className="text-slate-400 text-sm italic">
          No content yet (backend not connected).
        </p>
      );

    case 'linkedin':
      if (result.linkedin?.text) {
        return (
          <div className="whitespace-pre-wrap text-slate-100 leading-relaxed">
            {result.linkedin.text}
          </div>
        );
      }
      return (
        <p className="text-slate-400 text-sm italic">
          No content yet (backend not connected).
        </p>
      );

    case 'thread':
      if (result.thread?.tweets && Array.isArray(result.thread.tweets)) {
        return (
          <div className="space-y-3">
            {result.thread.tweets.map((tweet, idx) => (
              <div
                key={idx}
                className="bg-slate-900 rounded-lg p-3 text-slate-100 border border-slate-700"
              >
                <div className="text-xs text-slate-400 mb-1">Tweet {idx + 1}</div>
                <div className="whitespace-pre-wrap">{tweet}</div>
              </div>
            ))}
          </div>
        );
      }
      return (
        <p className="text-slate-400 text-sm italic">
          No content yet (backend not connected).
        </p>
      );

    case 'captions':
      if (result.captions && Array.isArray(result.captions) && result.captions.length > 0) {
        return (
          <div className="space-y-2">
            {result.captions.map((caption, idx) => (
              <div
                key={idx}
                className="bg-slate-900 rounded-lg p-3 text-slate-100 border border-slate-700"
              >
                {caption}
              </div>
            ))}
          </div>
        );
      }
      return (
        <p className="text-slate-400 text-sm italic">
          No content yet (backend not connected).
        </p>
      );

    case 'seo_keywords':
      if (result.seo_keywords && Array.isArray(result.seo_keywords) && result.seo_keywords.length > 0) {
        return (
          <div className="flex flex-wrap gap-2">
            {result.seo_keywords.map((keyword, idx) => (
              <span
                key={idx}
                className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-sm border border-indigo-500/30"
              >
                {keyword}
              </span>
            ))}
          </div>
        );
      }
      return (
        <p className="text-slate-400 text-sm italic">
          No content yet (backend not connected).
        </p>
      );

    default:
      return (
        <p className="text-slate-400 text-sm italic">
          No content yet (backend not connected).
        </p>
      );
  }
}

/**
 * @param {Object} props
 * @param {Object} props.message - ChatMessage object
 * @param {(variant: string) => void} props.onVariantChange
 */
export function MessageBubble({ message, onVariantChange }) {
  const { currentChatId, retryAssistantMessage } = useChatStore();
  const { role, status, progress, currentStep, result, activeVariant, jobId } = message;
  const activeVariantKey = activeVariant || 'blog';

  const handleFeedback = async (rating) => {
    if (!jobId || !activeVariant) return;
    
    try {
      await sendFeedback(jobId, {
        format: activeVariant,
        rating,
      });
    } catch (error) {
      console.error('Failed to send feedback:', error);
    }
  };

  const handleRetry = async () => {
    if (!currentChatId) return;
    try {
      await retryAssistantMessage(currentChatId, message.id);
    } catch (error) {
      console.error('Retry failed', error);
    }
  };

  if (role === 'user') {
    const modeLabel = {
      link: 'YouTube link',
      text: 'Text',
      file: `File: ${message.fileName || 'uploaded file'}`,
    }[message.mode] || 'Input';

    const copyValue =
      message.mode === 'file'
        ? `Uploaded file: ${message.fileName || 'file'}`
        : message.userInput || '';

    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%] md:max-w-[70%]">
          <div className="bg-indigo-600 text-slate-50 rounded-2xl px-4 py-3">
            <div className="text-sm mb-1 text-indigo-100 opacity-80">{modeLabel}</div>
            <div className="whitespace-pre-wrap">{message.userInput || message.fileName}</div>
          </div>
          <div className="flex justify-end mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-indigo-100 hover:text-white hover:bg-indigo-700/40"
              onClick={() => copyTextToClipboard(copyValue)}
              disabled={!copyValue}
            >
              <Copy size={16} className="mr-1" />
              Copy
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[80%] md:max-w-[70%] w-full">
        <div className="bg-slate-800 rounded-2xl p-4">
          {status === 'pending' || status === 'processing' ? (
            <div>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3">
                  <Spinner size="sm" />
                  <div className="text-slate-300">
                    {status === 'pending' ? 'Queuing your request...' : 'Processing your content...'}
                  </div>
                </div>
                {currentStep && (
                  <div className="text-sm text-slate-400">{currentStep}</div>
                )}
                {progress > 0 && (
                  <div className="pt-2">
                    <ProgressBar progress={progress} />
                  </div>
                )}
              </div>
              {/* Always show tabs even when processing */}
              <VariantTabs
                activeVariant={activeVariantKey}
                onVariantChange={onVariantChange}
                result={result}
              />
              <div className="mt-4">
                {renderContent(result, activeVariantKey)}
              </div>
            </div>
          ) : status === 'failed' ? (
            <div className="text-red-400">
              <div className="font-medium mb-2">Something went wrong while processing this request.</div>
              <div className="text-sm text-slate-400">
                Please try again or contact support if the issue persists.
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-200"
                  onClick={() => {
                    const contentToCopy = getResponseTextForCopy({ ...message, activeVariant: activeVariantKey });
                    if (contentToCopy) {
                      copyTextToClipboard(contentToCopy);
                    }
                  }}
                  disabled={!getResponseTextForCopy({ ...message, activeVariant: activeVariantKey })}
                >
                  <Copy size={16} className="mr-1" />
                  Copy response
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-200" onClick={handleRetry}>
                  <RotateCcw size={16} className="mr-1" />
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-xs text-slate-400 mb-3 uppercase tracking-wide">
                Repurposed content
              </div>
              {/* Always show tabs for assistant messages */}
              <VariantTabs
                activeVariant={activeVariantKey}
                onVariantChange={onVariantChange}
                result={result}
              />
              <div className="mt-4">
                {renderContent(result, activeVariantKey)}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-200"
                  onClick={() => {
                    const contentToCopy = getResponseTextForCopy({ ...message, activeVariant: activeVariantKey });
                    if (contentToCopy) {
                      copyTextToClipboard(contentToCopy);
                    }
                  }}
                  disabled={!getResponseTextForCopy({ ...message, activeVariant: activeVariantKey })}
                >
                  <Copy size={16} className="mr-1" />
                  Copy response
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-200" onClick={handleRetry}>
                  <RotateCcw size={16} className="mr-1" />
                  Retry
                </Button>
              </div>
              {status === 'done' && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>Was this helpful?</span>
                    <button
                      onClick={() => handleFeedback(5)}
                      className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                      aria-label="Thumbs up"
                    >
                      <ThumbsUp size={16} className="text-slate-400 hover:text-green-400" />
                    </button>
                    <button
                      onClick={() => handleFeedback(1)}
                      className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                      aria-label="Thumbs down"
                    >
                      <ThumbsDown size={16} className="text-slate-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


