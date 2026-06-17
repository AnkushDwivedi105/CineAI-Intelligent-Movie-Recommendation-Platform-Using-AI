import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand/5 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-md animate-fade-in relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-white text-5xl font-black tracking-tighter mb-2">
            CINE<span className="text-brand">AI</span>
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px]">Premium Discovery</p>
        </div>

        <div className="glass-card p-10 rounded-3xl border-white/5 shadow-2xl">
          <h2 className="text-2xl font-black text-white mb-8 tracking-tight">Welcome Back</h2>
          
          {error && (
            <div className="bg-brand/10 border border-brand/20 p-4 mb-6 rounded-xl text-brand text-xs font-bold text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="space-y-2">
              <label className="text-white/40 text-[10px] font-black uppercase tracking-widest ml-1">Username</label>
              <input 
                type="text" 
                placeholder="Enter your username" 
                className="w-full p-4 bg-white/5 rounded-xl text-white border border-white/5 focus:border-brand/40 focus:bg-white/10 outline-none transition-all placeholder:text-white/20 font-medium"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-white/40 text-[10px] font-black uppercase tracking-widest ml-1">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full p-4 bg-white/5 rounded-xl text-white border border-white/5 focus:border-brand/40 focus:bg-white/10 outline-none transition-all placeholder:text-white/20 font-medium"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
              <button 
                type="button"
                onClick={() => setRole('user')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${role === 'user' ? 'bg-brand text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                User
              </button>
              <button 
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${role === 'admin' ? 'bg-brand text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                Admin
              </button>
            </div>

            <button type="submit" className="w-full bg-brand text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-brand-hover transition-all transform active:scale-95 shadow-xl shadow-brand/20 mt-4">
              Sign In
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/40 text-sm font-medium">
              Don't have an account? <Link to="/signup" className="text-brand font-black hover:underline transition">Join CineAI</Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-20 flex gap-4 text-[10px] font-black uppercase tracking-widest">
        <span>© 2026 CINEAI</span>
        <span className="text-white/10">|</span>
        <span>Secure Access</span>
      </div>
    </div>
  );
};

export default Login;
