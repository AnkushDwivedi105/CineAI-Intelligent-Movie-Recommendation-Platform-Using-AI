import React, { useState } from 'react';
import api from '../api/axiosConfig';

const AdminModal = ({ onClose, onSuccess }) => {
  const [tab, setTab] = useState('movie'); // 'movie' or 'announcement'
  
  // Movie State
  const [title, setTitle] = useState('');
  const [genres, setGenres] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [tmdbId, setTmdbId] = useState('');
  
  // Announcement State
  const [content, setContent] = useState('');
  const [type, setType] = useState('update');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMovieSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/movies/', { title, genres, poster_url: posterUrl, tmdb_id: tmdbId });
      onSuccess('Movie added successfully!');
      onClose();
    } catch (err) {
      setError('Failed to add movie');
    }
    setLoading(false);
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/movies/announcements', { content, type });
      onSuccess('Announcement posted successfully!');
      onClose();
    } catch (err) {
      setError('Failed to post announcement');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[2000] flex items-center justify-center backdrop-blur-md animate-fade-in px-4">
      <div className="bg-bg-dark border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand to-purple-600" />
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-white tracking-tight">Admin Control</h2>
            <button onClick={onClose} className="text-white/40 hover:text-white transition">✕</button>
          </div>

          <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl">
            <button 
              onClick={() => { setTab('movie'); setError(''); }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${tab === 'movie' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
            >
              Add Movie
            </button>
            <button 
              onClick={() => { setTab('announcement'); setError(''); }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${tab === 'announcement' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
            >
              Post Ad/Update
            </button>
          </div>

          {error && <div className="bg-brand/10 text-brand text-xs font-bold p-3 rounded-xl mb-4 text-center border border-brand/20">{error}</div>}

          {tab === 'movie' ? (
            <form onSubmit={handleMovieSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-white/40 text-[10px] font-black uppercase tracking-widest ml-1">Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-3 bg-white/5 rounded-xl text-white border border-white/5 focus:border-brand/40 focus:bg-white/10 outline-none transition-all mt-1" />
              </div>
              <div>
                <label className="text-white/40 text-[10px] font-black uppercase tracking-widest ml-1">Genres (e.g. Action|Sci-Fi)</label>
                <input type="text" value={genres} onChange={e => setGenres(e.target.value)} className="w-full p-3 bg-white/5 rounded-xl text-white border border-white/5 focus:border-brand/40 focus:bg-white/10 outline-none transition-all mt-1" />
              </div>
              <div>
                <label className="text-white/40 text-[10px] font-black uppercase tracking-widest ml-1">TMDB ID (Optional)</label>
                <input type="number" value={tmdbId} onChange={e => setTmdbId(e.target.value)} className="w-full p-3 bg-white/5 rounded-xl text-white border border-white/5 focus:border-brand/40 focus:bg-white/10 outline-none transition-all mt-1" />
              </div>
              <div>
                <label className="text-white/40 text-[10px] font-black uppercase tracking-widest ml-1">Poster URL (Optional)</label>
                <input type="url" value={posterUrl} onChange={e => setPosterUrl(e.target.value)} className="w-full p-3 bg-white/5 rounded-xl text-white border border-white/5 focus:border-brand/40 focus:bg-white/10 outline-none transition-all mt-1" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-white/10 text-white py-3 rounded-xl font-black uppercase tracking-widest hover:bg-white/20 transition-all mt-4 border border-white/10">
                {loading ? 'Adding...' : 'Add Movie'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAnnouncementSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-white/40 text-[10px] font-black uppercase tracking-widest ml-1">Content</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} required rows="3" className="w-full p-3 bg-white/5 rounded-xl text-white border border-white/5 focus:border-brand/40 focus:bg-white/10 outline-none transition-all mt-1 resize-none" />
              </div>
              <div>
                <label className="text-white/40 text-[10px] font-black uppercase tracking-widest ml-1">Type</label>
                <select value={type} onChange={e => setType(e.target.value)} className="w-full p-3 bg-[#1a1a1a] rounded-xl text-white border border-white/5 outline-none mt-1">
                  <option value="update">Platform Update</option>
                  <option value="ad">Advertisement</option>
                </select>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-brand text-white py-3 rounded-xl font-black uppercase tracking-widest hover:bg-brand-hover transition-all mt-4 shadow-lg shadow-brand/20">
                {loading ? 'Posting...' : 'Post to Platform'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
