import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { ChevronLeft, Server, Activity, ShieldCheck, Info } from 'lucide-react';
import { playSound } from '../utils/soundUtils';

const Watch = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [movie, setMovie] = useState(location.state?.movie || null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeServer, setActiveServer] = useState('Server 1');
  const [showControls, setShowControls] = useState(true);

  // High-performance streaming servers
  const servers = {
    'Server 1': `https://vidlink.pro/embed/movie/${id}?autoplay=true`,
    'Server 2': `https://vidsrc.xyz/embed/movie/${id}?autoplay=1`,
    'Server 3': `https://vidsrc.to/embed/movie/${id}`,
    'Server 4': `https://www.2embed.cc/embed/${id}`,
  };

  useEffect(() => {
    const fetchMovieData = async () => {
      if (!movie) {
        try {
          const res = await api.get(`/movies/${id}/live`);
          setMovie(res.data);
        } catch (err) {
          console.error("Failed to fetch movie info:", err);
        }
      }
    };
    fetchMovieData();

    // Auto-hide controls after 3 seconds of inactivity
    let timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 5000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [id, movie]);

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col overflow-hidden select-none">
      
      {/* Immersive Top Bar */}
      <div className={`absolute top-0 left-0 right-0 z-50 p-6 flex items-center justify-between transition-all duration-700 bg-gradient-to-b from-black/80 to-transparent ${showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => { playSound('pop'); navigate(-1); }}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-brand flex items-center justify-center transition-all border border-white/10 backdrop-blur-md group"
          >
            <ChevronLeft className="text-white group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-white font-black text-2xl tracking-tighter uppercase italic line-clamp-1">
              {movie?.title || 'Now Playing'}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1.5 text-green-500 text-[10px] font-black uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live Stream
              </span>
              <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest px-2 border-l border-white/10">
                Ultra HD 4K
              </span>
            </div>
          </div>
        </div>

        {/* Server Selector in Header */}
        <div className="hidden md:flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
          {Object.keys(servers).map((s) => (
            <button
              key={s}
              onClick={() => {
                if (activeServer !== s) {
                  playSound('click');
                  setActiveServer(s);
                  setIsLoading(true);
                }
              }}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeServer === s
                  ? 'bg-brand text-white shadow-lg'
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Video Section */}
      <div className="relative flex-1 w-full bg-black">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black">
            <div className="relative">
               <div className="w-20 h-20 border-2 border-brand/20 border-t-brand rounded-full animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-brand/20 rounded-full animate-ping" />
               </div>
            </div>
            <p className="mt-8 text-white font-black uppercase tracking-[0.4em] text-xs animate-pulse opacity-50">
               Initializing Cinematic Stream...
            </p>
          </div>
        )}
        
        <iframe
          key={activeServer}
          src={servers[activeServer]}
          className="w-full h-full border-none shadow-2xl"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          allow="autoplay; fullscreen; picture-in-picture"
          title={movie?.title || 'Player'}
        />
      </div>

      {/* Bottom Info Bar (Auto-hiding) */}
      <div className={`absolute bottom-0 left-0 right-0 z-50 p-8 transition-all duration-700 bg-gradient-to-t from-black/90 to-transparent ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
         <div className="flex flex-col md:flex-row items-end justify-between gap-6 max-w-7xl mx-auto w-full">
            <div className="flex gap-8">
               <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-white/40">
                     <ShieldCheck size={14} />
                     <span className="text-[9px] font-black uppercase tracking-widest">Secure Connection</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/40">
                     <Activity size={14} />
                     <span className="text-[9px] font-black uppercase tracking-widest">High Speed Protocol</span>
                  </div>
               </div>
               <div className="h-10 w-px bg-white/10" />
               <div className="flex flex-col gap-1">
                  <span className="text-white/20 text-[8px] font-black uppercase tracking-widest">Current Server</span>
                  <span className="text-brand font-black text-sm uppercase">{activeServer}</span>
               </div>
            </div>

            <div className="flex items-center gap-4 bg-brand/10 border border-brand/20 px-6 py-3 rounded-2xl backdrop-blur-md">
               <Info size={16} className="text-brand" />
               <p className="text-white/70 text-[10px] font-medium leading-relaxed">
                  Experiencing issues? Switch servers from the top panel for a better experience. 
                  <br /> <span className="text-white/40 italic">Note: Content is hosted by third-party providers.</span>
               </p>
            </div>
         </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Watch;
