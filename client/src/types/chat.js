// Frontend chat types (JavaScript type documentation)

/**
 * @typedef {'blog' | 'linkedin' | 'thread' | 'captions' | 'seo_keywords'} ContentVariant
 */

/**
 * @typedef {Object} JobResult
 * @property {Object} [blog] - { text: string; word_count?: number }
 * @property {Object} [linkedin] - { text: string }
 * @property {Object} [thread] - { tweets: string[] }
 * @property {string[]} [captions]
 * @property {string[]} [seo_keywords]
 * @property {string} [transcript]
 * @property {Array<{ type: string; url: string }>} [artifacts]
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string} id - local unique id
 * @property {string} jobId - backend job_id
 * @property {string} createdAt - ISO timestamp
 * @property {'user' | 'assistant'} role
 * @property {string} [userInput] - for user messages
 * @property {'link' | 'text' | 'file'} [mode] - for user messages
 * @property {string} [fileName] - for user messages
 * @property {'pending' | 'processing' | 'done' | 'failed'} [status] - for assistant messages
 * @property {number} [progress] - 0-100, for assistant messages
 * @property {string} [currentStep] - for assistant messages
 * @property {JobResult} [result] - full result from API, for assistant messages
 * @property {ContentVariant} [activeVariant] - currently selected variant tab
 */

/**
 * @typedef {Object} ChatThread
 * @property {string} id - frontend chat id
 * @property {string} title - derived from first user query or "New chat"
 * @property {string} createdAt - ISO timestamp
 * @property {string} updatedAt - ISO timestamp
 * @property {ChatMessage[]} messages
 */


