import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './state/authContext.jsx';
import { ChatProvider } from './state/chatStore.jsx';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { Home } from './routes/Home.jsx';
import { SignupPage } from './routes/SignupPage.jsx';
import { LoginPage } from './routes/LoginPage.jsx';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signup" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ChatProvider>
              <AppLayout>
                <Home />
              </AppLayout>
            </ChatProvider>
          </ProtectedRoute>
        }
      />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
