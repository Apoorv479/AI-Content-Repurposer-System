import React, { createContext, useContext } from 'react';

const UserContext = createContext(null);

// Mock user for now (replace with real auth later)
const MOCK_USER = {
  id: '1',
  name: 'Apoorv',
  email: 'john@example.com',
};

export function UserProvider({ children }) {
  return (
    <UserContext.Provider value={MOCK_USER}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

