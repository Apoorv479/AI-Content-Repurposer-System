import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { IconButton } from '../common/IconButton.jsx';
import { useAuth } from '../../state/authContext.jsx';

/**
 * @param {Object} props
 * @param {() => void} props.onMenuClick
 */
export function TopBar({ onMenuClick }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-3 sticky top-0 z-50">
      <IconButton
        onClick={onMenuClick}
        variant="ghost"
        size="sm"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </IconButton>
      <div className="text-lg font-semibold text-slate-100 flex-1">Recraft AI 1.0</div>
      <button
        onClick={handleLogout}
        className="rounded-full bg-slate-900 border border-slate-700 px-4 py-1.5 text-sm text-slate-100 hover:bg-slate-800 hover:border-indigo-500 transition flex items-center gap-2"
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
  );
}



