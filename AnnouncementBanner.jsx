import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/movies/announcements');
        if (res.data && res.data.length > 0) {
          setAnnouncements(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      }
    };
    fetchAnnouncements();
  }, []);

  if (announcements.length === 0 || dismissed) return null;

  // Show the most recent one
  const latest = announcements[0];
  const isAd = latest.type === 'ad';

  return (
    <div className={`w-full ${isAd ? 'bg-brand text-white' : 'bg-white/10 text-white border-b border-white/10'} px-4 py-3 relative z-50 animate-fade-in`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">{isAd ? '📢' : '🔔'}</span>
          <p className="text-sm font-bold tracking-wide">
            {isAd && <span className="uppercase text-[10px] tracking-widest bg-white/20 px-2 py-0.5 rounded-sm mr-2">Ad</span>}
            {latest.content}
          </p>
        </div>
        <button 
          onClick={() => setDismissed(true)}
          className="text-white/60 hover:text-white transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
