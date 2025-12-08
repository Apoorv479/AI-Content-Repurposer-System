import React, { createContext, useContext, useState, useEffect } from 'react';
import { signupApi, loginApi } from '../api/authClient.js';

const AUTH_STORAGE_KEY = 'recraft_auth_user';

/**
 * @typedef {Object} AuthUser
 * @property {string} id
 * @property {string} username
 * @property {string} email
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {AuthUser | null} user
 * @property {boolean} isLoading
 * @property {(data: {username: string, email: string, password: string}) => Promise<void>} signup
 * @property {(data: {email: string, password: string}) => Promise<void>} login
 * @property {() => void} logout
 */

const AuthContext = createContext(/** @type {AuthContextValue | null} */ (null));

export function AuthProvider({ children }) {
  const [user, setUser] = useState(/** @type {AuthUser | null} */ (null));
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch (error) {
      console.error('Failed to load auth from localStorage:', error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * @param {Object} data
   * @param {string} data.username
   * @param {string} data.email
   * @param {string} data.password
   */
  const signup = async (data) => {
    try {
      const userData = await signupApi(data);
      setUser(userData);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  /**
   * @param {Object} data
   * @param {string} data.email
   * @param {string} data.password
   */
  const login = async (data) => {
    try {
      const userData = await loginApi(data);
      setUser(userData);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = {
    user,
    isLoading,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * @returns {AuthContextValue}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

