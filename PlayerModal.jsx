import React, { useState, useEffect } from 'react';
import { playSound } from '../utils/soundUtils';

/**
 * PlayerModal - A highly resilient movie player component.
 * Features multiple server fallbacks and a premium UI.
 */
const PlayerModal = ({ tmdbId, imdbId, onClose }) => {
  const [activeServer, setActiveServer] = useState('Server 1 (Fast)');
  const [isLoading, setIsLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  const servers = {
    'Server 1 (Fast)': `https://vidlink.pro/embed/movie/${tmdbId}?autoplay=true&primary_color=e50914`,
    'Server 2': `https://vidsrc.xyz/embed/movie/${tmdbId}?autoplay=1`,
    'Server 3 (IMDB)': `https://vidsrc.me/embed/movie?imdb=${imdbId}&autoplay=1`,
    'Server 4': `https://vidsrc.to/embed/movie/${tmdbId}`,
    'Server 5 (Proxy)': `https://www.2embed.cc/embed/${tmdbId}`,
    'Server 6 (Extra)': `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`,
  };

  useEffect(() => {
    setIsLoading(true);
    // Auto-hide tooltip after 5 seconds
    const timer = setTimeout(() => setShowTooltip(true), 3000);
    const timer2 = setTimeout(() => setShowTooltip(false), 8000);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [activeServer]);

  return (
    <div 
      className="fixed inset-0 bg-black/98 z-[5000] flex flex-col items-center justify-start p-4 md:p-8 overflow-y-auto backdrop-blur-sm"
      style={{ animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
      onClick={onClose}
    >
      {/* Main Container */}
      <div 
        className="w-full max-w-7xl flex flex-col gap-4 mt-4 md:mt-10"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header Control Panel */}
        <div className="glass-card p-4 md:p-6 rounded-[2rem] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
          {/* Decorative background glow */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-brand/20 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center gap-6 z-10">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_#22c55e]" />
              <h2 className="text-white font-black text-xl md:text-2xl tracking-tighter uppercase italic">
                Streaming <span className="text-brand">Live</span>
              </h2>
            </div>

            {/* Server Tabs */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/5">
              {Object.keys(servers).map((server) => (
                <button
                  key={server}
                  onClick={() => {
                    if (activeServer !== server) {
                      playSound('click');
                      setActiveServer(server);
                    }
                  }}
                  className={`px-4 md:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeServer === server
                      ? 'bg-brand text-white shadow-[0_10px_20px_-5px_rgba(229,9,20,0.5)] scale-105'
                      : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  {server}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              playSound('pop');
              onClose();
            }}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/5 text-white flex items-center justify-center hover:bg-red-600 transition-all hover:rotate-90 border border-white/10 active:scale-90"
          >
            <span className="text-xl md:text-2xl">✕</span>
          </button>
        </div>

        {/* Video Player Box */}
        <div className="relative w-full aspect-video glass-card rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] border border-white/10 group bg-black">
          
          {/* Iframe */}
          <iframe
            key={activeServer}
            src={servers[activeServer]}
            className={`w-full h-full transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            allowFullScreen
            title="Movie Stream"
            onLoad={() => setIsLoading(false)}
            allow="autoplay; fullscreen; picture-in-picture"
          />

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/40 backdrop-blur-md">
              <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Connecting to {activeServer}...</p>
            </div>
          )}

          {/* Smart Tooltip / Help */}
          {showTooltip && (
            <div 
              className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3 animate-fade-in shadow-2xl pointer-events-none"
              style={{ animation: 'fadeInUp 0.5s ease-out' }}
            >
              <div className="w-8 h-8 bg-brand/20 rounded-full flex items-center justify-center text-brand">💡</div>
              <p className="text-white/80 text-xs font-medium">
                Not loading? Try switching to <span className="text-brand font-bold">Server 2</span> or <span className="text-brand font-bold">Server 3</span>.
              </p>
            </div>
          )}

          {/* Decorative Corner Elements */}
          <div className="absolute top-6 left-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="px-3 py-1 bg-black/60 rounded-full text-[8px] text-white/50 font-black tracking-widest border border-white/10 backdrop-blur-md uppercase">4K Ready</span>
            <span className="px-3 py-1 bg-black/60 rounded-full text-[8px] text-white/50 font-black tracking-widest border border-white/10 backdrop-blur-md uppercase">Surround 5.1</span>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 md:px-10 mt-2">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-white/20 text-[8px] font-black uppercase tracking-[0.3em] mb-1">Status</span>
              <span className="text-green-500/60 text-[10px] font-bold flex items-center gap-1.5 uppercase">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Encryption Active
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-white/20 text-[8px] font-black uppercase tracking-[0.3em] mb-1">Protocol</span>
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Secure HTTPS</span>
            </div>
          </div>

          <p className="text-white/10 text-[9px] font-medium text-center md:text-right max-w-md">
            This stream is provided by third-party servers. If you experience buffering, please check your internet connection or switch servers above.
          </p>
        </div>

      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
};

export default PlayerModal;
