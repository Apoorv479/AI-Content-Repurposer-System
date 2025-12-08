/**
 * Auth API client - placeholder functions for backend integration
 * TODO: Replace with real API calls when backend is ready
 */

/**
 * @param {Object} data
 * @param {string} data.username
 * @param {string} data.email
 * @param {string} data.password
 * @returns {Promise<{id: string, username: string, email: string}>}
 */
export async function signupApi(data) {
  // TODO: Replace with real API call later
  // Simulate network delay
  await new Promise((res) => setTimeout(res, 400));

  return {
    id: crypto.randomUUID?.() ?? String(Date.now()),
    username: data.username,
    email: data.email,
    // token: "dummy-token",
  };
}

/**
 * @param {Object} data
 * @param {string} data.email
 * @param {string} data.password
 * @returns {Promise<{id: string, username: string, email: string}>}
 */
export async function loginApi(data) {
  // TODO: Replace with real API call later
  await new Promise((res) => setTimeout(res, 400));

  // For now, just create a dummy user using the part before '@' as username
  const username = data.email.split("@")[0] || "Creator";

  return {
    id: crypto.randomUUID?.() ?? String(Date.now()),
    username,
    email: data.email,
    // token: "dummy-token",
  };
}

