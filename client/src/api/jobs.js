import { apiRequest, apiUpload } from './client.js';

/**
 * Start a processing job
 * @param {Object} payload
 * @param {'link' | 'text' | 'file'} payload.mode
 * @param {string} [payload.input] - youtube URL if mode='link', raw text if 'text'
 * @param {File} [payload.file] - only when mode='file'
 * @param {Object} [payload.options]
 * @param {string} [payload.options.language]
 * @param {('blog' | 'linkedin' | 'thread' | 'captions' | 'seo_keywords')[]} [payload.options.target_formats]
 * @param {string} [payload.options.tone]
 * @param {number} [payload.options.keywords_count]
 * @returns {Promise<{ job_id: string; status: 'queued' | 'processing' }>}
 */
export async function startProcess(payload) {
  const { mode, input, file, options } = payload;

  if (mode === 'file' && file) {
    // Use multipart/form-data for file uploads
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode);
    
    if (options) {
      if (options.target_formats) {
        options.target_formats.forEach(format => {
          formData.append('options[target_formats][]', format);
        });
      }
      if (options.language) {
        formData.append('options[language]', options.language);
      }
      if (options.tone) {
        formData.append('options[tone]', options.tone);
      }
      if (options.keywords_count) {
        formData.append('options[keywords_count]', options.keywords_count.toString());
      }
    }

    return await apiUpload('/process', formData);
  } else {
    // Use JSON for link and text modes
    const body = {
      mode,
      input,
      options: options || {
        target_formats: ['blog', 'linkedin', 'thread', 'captions', 'seo_keywords'],
      },
    };

    return await apiRequest('/process', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}

/**
 * Get job status
 * @param {string} jobId
 * @returns {Promise<{ job_id: string; status: 'queued' | 'processing' | 'done' | 'failed'; progress: number; current_step?: string }>}
 */
export async function getJobStatus(jobId) {
  return await apiRequest(`/status/${jobId}`);
}

/**
 * Get job result
 * @param {string} jobId
 * @returns {Promise<{ job_id: string; result: Object }>}
 */
export async function getJobResult(jobId) {
  return await apiRequest(`/result/${jobId}`);
}

/**
 * Upload file (alternative endpoint)
 * @param {File} file
 * @returns {Promise<{ job_id: string; status: 'queued' | 'processing' }>}
 */
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  return await apiUpload('/upload', formData);
}

/**
 * Send feedback for a job
 * @param {string} jobId
 * @param {Object} payload
 * @param {'blog' | 'linkedin' | 'thread' | 'captions' | 'seo_keywords'} payload.format
 * @param {1 | 2 | 3 | 4 | 5} payload.rating
 * @param {string} [payload.notes]
 * @returns {Promise<any>}
 */
export async function sendFeedback(jobId, payload) {
  return await apiRequest(`/feedback/${jobId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}


