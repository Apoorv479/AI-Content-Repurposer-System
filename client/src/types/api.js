// API response types (JavaScript type documentation)

/**
 * @typedef {Object} ProcessResponse
 * @property {string} job_id
 * @property {'queued' | 'processing'} status
 */

/**
 * @typedef {Object} JobStatusResponse
 * @property {string} job_id
 * @property {'queued' | 'processing' | 'done' | 'failed'} status
 * @property {number} progress - 0-100
 * @property {string} [current_step] - optional descriptive step
 */

/**
 * @typedef {Object} BlogResult
 * @property {string} text
 * @property {number} [word_count]
 */

/**
 * @typedef {Object} LinkedInResult
 * @property {string} text
 */

/**
 * @typedef {Object} JobResultData
 * @property {BlogResult} [blog]
 * @property {LinkedInResult} [linkedin]
 * @property {{ tweets: string[] }} [thread]
 * @property {string[]} [captions]
 * @property {string[]} [seo_keywords]
 * @property {string} [transcript]
 * @property {{ type: string; url: string }[]} [artifacts]
 */

/**
 * @typedef {Object} JobResultResponse
 * @property {string} job_id
 * @property {JobResultData} result
 */

/**
 * @typedef {Object} UploadResponse
 * @property {string} job_id
 * @property {'queued' | 'processing'} status
 */


