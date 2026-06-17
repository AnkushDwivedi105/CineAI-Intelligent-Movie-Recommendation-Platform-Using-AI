import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { playSound } from '../utils/soundUtils';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    playSound('pop');
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] px-8 md:px-16 py-6 flex justify-between items-center transition-all duration-300">
      <div className="absolute inset-0 bg-bg-dark/60 backdrop-blur-xl border-b border-white/5" />
      
      <div className="relative flex items-center gap-12">
        <Link to="/" className="text-white text-3xl font-black tracking-tighter hover:scale-105 transition transform active:scale-95 group">
          CINE<span className="text-brand group-hover:text-white transition">AI</span>
        </Link>
        
        {user && (
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-white/50">
            <Link to="/" onClick={() => playSound('click')} className="hover:text-white transition text-white">Home</Link>
            <Link to="/" onClick={() => playSound('click')} className="hover:text-white transition">Movies</Link>
            <Link to="/" onClick={() => playSound('click')} className="hover:text-white transition">New & Popular</Link>
          </nav>
        )}
      </div>

      {user && (
        <div className="relative flex items-center gap-8">
          <div className="flex items-center gap-3 glass-card px-4 py-2 rounded-xl border-white/5">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-black text-sm">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="text-white/80 text-sm font-bold hidden sm:inline">{user.username}</span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="text-white/40 hover:text-brand transition font-bold text-xs uppercase tracking-widest"
          >
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
