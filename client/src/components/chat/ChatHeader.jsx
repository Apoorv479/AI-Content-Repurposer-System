import React from 'react';
import { useAuth } from '../../state/authContext.jsx';

export function ChatHeader() {
  const { user } = useAuth();

  return (
    <div className="text-center py-8">
      <h1 className="text-4xl font-bold text-slate-100 mb-2">
        Hello Creator, {user?.username ?? 'Creator'}
      </h1>
      <p className="text-slate-400 text-lg">
         <h3>One input → Every kind of content</h3>
         Let AI convert your video, text, or files into ready-to-publish content in seconds.
      </p>
    </div>
  );
}


