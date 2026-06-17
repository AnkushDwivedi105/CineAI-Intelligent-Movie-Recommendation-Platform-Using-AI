import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { playSound } from '../utils/soundUtils';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import HeroCarousel from '../components/HeroCarousel';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import PlayerModal from '../components/PlayerModal';
import AnnouncementBanner from '../components/AnnouncementBanner';
import AdminModal from '../components/AdminModal';

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-8 right-8 z-[9999] animate-fade-in">
      <div className="glass-card p-4 flex items-center gap-4 rounded-xl border-brand/20">
        <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center">⚠️</div>
        <p className="text-white/80 text-sm">{message}</p>
        <button onClick={onClose} className="ml-4 opacity-40 hover:opacity-100 transition">✕</button>
      </div>
    </div>
  );
};


// ── Shared UI Components ──────────────────────────────────────────────────────
const SectionHeader = ({ title, emoji }) => (
  <div className="flex items-center gap-3 mb-6 px-2">
    <div className="w-1 h-8 bg-brand rounded-full" />
    <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{emoji && <span className="mr-2">{emoji}</span>}{title}</h2>
    <div className="h-px flex-1 bg-gradient-to-r from-brand/30 to-transparent" />
  </div>
);

const Skeleton = ({ count = 6 }) => (
  <>{[...Array(count)].map((_, i) => (<SwiperSlide key={i}><div className="aspect-[2/3] bg-white/5 animate-pulse rounded-2xl" /></SwiperSlide>))}</>
);

const swiperBreakpoints = { 480: { slidesPerView: 3 }, 768: { slidesPerView: 4 }, 1024: { slidesPerView: 5 }, 1280: { slidesPerView: 6 } };

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [recommendations, setRecommendations] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [toast, setToast] = useState(null);
  const [detectedMood, setDetectedMood] = useState(null);
  const [isLiveEnabled, setIsLiveEnabled] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [currentImdbId, setCurrentImdbId] = useState(null);
  const [playerLoading, setPlayerLoading] = useState(false);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [relatedTo, setRelatedTo] = useState('');
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [topRated, setTopRated] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [userListKey, setUserListKey] = useState(0);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const isAdmin = user?.role === 'admin';

  const fetchRecommendations = useCallback(async (overrideGenre = null) => {
    setLoadingRecs(true);
    if (!user && !overrideGenre) {
      try {
        const cached = localStorage.getItem('cache_recs');
        if (cached) { setRecommendations(JSON.parse(cached)); setLoadingRecs(false); }
      } catch (_) {}
    }
    try {
      const url = overrideGenre ? `/recommendations?genre=${overrideGenre}` : '/recommendations';
      const res = await api.get(url);
      const data = res.data.recommendations || [];
      setRecommendations(data);
      if (!user && !overrideGenre) localStorage.setItem('cache_recs', JSON.stringify(data));
    } catch (e) { console.error(e); }
    finally { setLoadingRecs(false); }
  }, [user]);

  const fetchTrending = useCallback(async () => {
    setLoadingTrending(true);
    try {
      const res = await api.get('/movies/trending');
      setTrendingMovies(res.data.movies || []);
    } catch (e) { console.error(e); }
    finally { setLoadingTrending(false); }
  }, []);

  const fetchInitialData = useCallback(async () => {
    setLoadingRecs(true);
    setLoadingTrending(true);
    try {
      const res = await api.get('/home/bootstrap');
      const { trending, recommendations, topRated, favorites, isLiveEnabled } = res.data;
      
      setTrendingMovies(trending || []);
      setRecommendations(recommendations || []);
      setTopRated(topRated || []);
      setFavorites(favorites || []);
      setIsLiveEnabled(!!isLiveEnabled);
      
      if (!user && recommendations) {
        localStorage.setItem('cache_recs', JSON.stringify(recommendations));
      }
      setLoadingRecs(false);
      setLoadingTrending(false);
    } catch (e) {
      console.error('Bootstrap failed, falling back to individual calls:', e);
      // Run fallbacks in parallel, each manages its own loading state
      try {
        const [trendRes, recRes] = await Promise.allSettled([
          api.get('/movies/trending'),
          api.get('/recommendations')
        ]);
        if (trendRes.status === 'fulfilled') setTrendingMovies(trendRes.value.data.movies || []);
        if (recRes.status === 'fulfilled') setRecommendations(recRes.value.data.recommendations || []);
      } catch (_) {}
      setLoadingRecs(false);
      setLoadingTrending(false);
    }
  }, [user, fetchTrending, fetchRecommendations]);

  const handleInteraction = useCallback(() => {
    localStorage.removeItem('cache_movies_p1');
    localStorage.removeItem('cache_recs');
    fetchInitialData();
  }, [fetchInitialData]);

  const navigate = useNavigate();

  const handlePlay = async (movie) => {
    if (!movie) return;
    const playId = movie.tmdb_id || movie.id;
    if (!playId) { setToast({ message: 'Streaming not available.' }); return; }
    
    // If it's already a TMDB ID, navigate instantly
    if (movie.tmdb_id) {
      navigate(`/watch/${movie.tmdb_id}`, { state: { movie } });
      return;
    }
    
    // Otherwise, fetch/resolve it from the backend
    setPlayerLoading(true);
    try {
      const res = await api.get(`/movies/${playId}/live`);
      if (res.data.tmdb_id) {
        navigate(`/watch/${res.data.tmdb_id}`, { state: { movie: res.data } });
      } else { setToast({ message: 'Not available for streaming yet.' }); }
    } catch (e) { 
      setToast({ message: 'Failed to load stream.' }); 
    } finally { setPlayerLoading(false); }
  };

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    try {
      await api.delete(`/movies/${movieId}`);
      setToast({ message: 'Movie deleted successfully' });
      handleInteraction(); // Refresh lists
    } catch (e) {
      setToast({ message: 'Failed to delete movie' });
    }
  };

  const fetchMovies = useCallback(async (p, search) => {
    if (p === 1 && !search && !user) {
      try {
        const cached = localStorage.getItem('cache_movies_p1');
        if (cached) { setAllMovies(JSON.parse(cached)); setLoadingMovies(false); }
      } catch (_) {}
    }
    setLoadingMovies(true);
    try {
      const limit = (p === 1 && !search) ? 12 : 24;
      const res = await api.get(`/movies?page=${p}&limit=${limit}&search=${search}`);
      const movies = res.data.movies || [];
      setAllMovies(prev => p === 1 ? movies : [...prev, ...movies]);
      setHasMore(p < res.data.pages);
      if (p === 1 && !search && !user) localStorage.setItem('cache_movies_p1', JSON.stringify(movies));
    } catch (e) { console.error(e); }
    finally { setLoadingMovies(false); }
  }, [user]);

  useEffect(() => { fetchMovies(page, searchQuery); }, [page, searchQuery, fetchMovies]);
  useEffect(() => { 
    if (!searchQuery) fetchInitialData(); 
  }, [fetchInitialData, searchQuery]);

  const handleSearch = useCallback(async (q) => {
    setSearchQuery(q); 
    setPage(1); 
    
    if (q) {
      setLoadingRelated(true);
      try {
        // Track interest for mood detection
        const trackRes = await api.post('/track-interest', { query: q });
        if (trackRes.data.genre && trackRes.data.message !== "No genre mapped") {
            setDetectedMood(trackRes.data.genre);
            setToast({ message: `✨ We noticed you're in the mood for ${trackRes.data.genre}! We've updated your recommendations.` });
            fetchRecommendations(trackRes.data.genre); // Instantly update Just For You
        } else {
            setDetectedMood(null);
        }
        
        const res = await api.get(`/movies/related?search=${q}`);
        setRelatedMovies(res.data.movies || []);
        setRelatedTo(res.data.related_to || q);
      } catch (e) { console.error(e); }
      finally { setLoadingRelated(false); }
    } else { 
      setRelatedMovies([]); 
      setDetectedMood(null);
    }
  }, [user, fetchRecommendations]);

  const moodBadges = [
    { label: '🤣 Funny', query: 'funny' },
    { label: '😭 Emotional', query: 'emotional' },
    { label: '😱 Scary', query: 'scary' },
    { label: '💥 Action', query: 'action' },
    { label: '👽 Sci-Fi', query: 'space' },
    { label: '❤️ Romance', query: 'love' }
  ];

  return (
    <div className="min-h-screen bg-bg-dark pb-20 selection:bg-brand selection:text-white">
      <Header />
      {!searchQuery && <AnnouncementBanner />}
      {toast && <Toast message={toast.message} onClose={() => setToast(null)} />}
      <main className="px-6 md:px-14 mt-8">
        {isAdmin && (
          <div className="mb-8 flex justify-end animate-fade-in">
            <button 
              onClick={() => setShowAdminModal(true)}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 transition border border-white/10"
            >
              <span>⚙️</span> Global Management
            </button>
          </div>
        )}

        {!searchQuery && (
          <HeroCarousel 
            movies={
              trendingMovies.length > 0 ? trendingMovies : 
              recommendations.length > 0 ? recommendations.slice(0, 5) :
              allMovies.slice(0, 5)
            } 
            loading={(loadingTrending || loadingMovies) && trendingMovies.length === 0 && recommendations.length === 0 && allMovies.length === 0} 
            onPlay={handlePlay} 
            onInteraction={handleInteraction} 
          />
        )}

        {!isLiveEnabled && !searchQuery && (
          <div className="glass-card p-5 mb-14 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border-brand/20 animate-fade-in">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-brand/10 rounded-full flex items-center justify-center text-2xl">🔑</div>
              <div><h3 className="text-lg font-black mb-1">Unlock Cinematic Posters</h3><p className="text-white/50 text-sm">Add a TMDB API key to display real movie posters.</p></div>
            </div>
            <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="bg-brand text-white px-7 py-3 rounded-xl font-bold hover:bg-brand-hover transition whitespace-nowrap shadow-xl shadow-brand/20">Get Free API Key</a>
          </div>
        )}

        {!searchQuery && (
          <div className="mb-16">
            <SectionHeader title="Just For You" emoji="✨" />
            <Swiper modules={[Autoplay, Navigation]} spaceBetween={16} slidesPerView={2} autoplay={{ delay: 3500, disableOnInteraction: false }} breakpoints={swiperBreakpoints} className="pb-10">
              {loadingRecs ? <Skeleton /> : recommendations.map(movie => (
                <SwiperSlide key={movie.id}><MovieCard movie={movie} onPlay={handlePlay} onInteraction={handleInteraction} onDelete={isAdmin ? handleDeleteMovie : null} /></SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {!searchQuery && (
          <div className="mb-16" key={`ratings-${userListKey}`}>
            <SectionHeader title="Your Top Ratings" emoji="⭐" />
            {topRated.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center text-white/30"><p className="text-4xl mb-3">⭐</p><p className="font-bold text-lg">No ratings yet</p><p className="text-sm mt-1">Hover over any movie and click the stars to rate it!</p></div>
            ) : (
              <Swiper modules={[Navigation]} spaceBetween={16} slidesPerView={2} breakpoints={swiperBreakpoints} className="pb-10">
                {topRated.map(movie => (<SwiperSlide key={movie.id}><MovieCard movie={movie} onPlay={handlePlay} onInteraction={handleInteraction} onDelete={isAdmin ? handleDeleteMovie : null} /></SwiperSlide>))}
              </Swiper>
            )}
          </div>
        )}

        {!searchQuery && (
          <div className="mb-16" key={`favorites-${userListKey}`}>
            <SectionHeader title="Your Favorites" emoji="❤️" />
            {favorites.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center text-white/30"><p className="text-4xl mb-3">🤍</p><p className="font-bold text-lg">No favorites yet</p><p className="text-sm mt-1">Hover over any movie and click the heart to save it!</p></div>
            ) : (
              <Swiper modules={[Navigation]} spaceBetween={16} slidesPerView={2} breakpoints={swiperBreakpoints} className="pb-10">
                {favorites.map(movie => (<SwiperSlide key={movie.id}><MovieCard movie={movie} onPlay={handlePlay} onInteraction={handleInteraction} onDelete={isAdmin ? handleDeleteMovie : null} /></SwiperSlide>))}
              </Swiper>
            )}
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 border-t border-white/5 pt-14">
          <SectionHeader title={searchQuery ? `Results for "${searchQuery}"${detectedMood ? ` (${detectedMood})` : ''}` : 'Library'} />
          <div className="flex flex-col items-end gap-3">
             <SearchBar onSearch={handleSearch} />
             {!searchQuery && (
               <div className="flex flex-wrap justify-end gap-2">
                 {moodBadges.map(mood => (
                   <button 
                     key={mood.query}
                     onClick={() => { playSound('click'); handleSearch(mood.query); }}
                     className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-brand/20 border border-white/10 text-xs text-white/70 hover:text-white transition cursor-pointer"
                   >
                     {mood.label}
                   </button>
                 ))}
               </div>
             )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
          {allMovies.map(movie => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              onPlay={handlePlay} 
              onInteraction={handleInteraction} 
              onDelete={isAdmin ? handleDeleteMovie : null} 
              searchTag={searchQuery}
            />
          ))}
          {loadingMovies && [...Array(12)].map((_, i) => (<div key={i} className="aspect-[2/3] w-full bg-white/5 animate-pulse rounded-2xl" />))}
        </div>

        {hasMore && !loadingMovies && (
          <div className="flex justify-center mt-16">
            <button onClick={() => { playSound('pop'); setPage(page + 1); }} className="glass-card text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-brand transition transform active:scale-90">Load More</button>
          </div>
        )}
      </main>

      {showPlayer && currentPlayerId && (<PlayerModal tmdbId={currentPlayerId} imdbId={currentImdbId} onClose={() => { setShowPlayer(false); setCurrentPlayerId(null); setCurrentImdbId(null); }} />)}
      {playerLoading && (<div className="fixed inset-0 bg-black/60 z-[3000] flex flex-col items-center justify-center backdrop-blur-sm animate-fade-in"><div className="w-16 h-16 border-4 border-brand/20 border-t-brand rounded-full animate-spin mb-4" /><p className="text-white font-black uppercase tracking-[0.3em] text-sm animate-pulse">Initializing Stream...</p></div>)}
      {showAdminModal && (
        <AdminModal 
          onClose={() => setShowAdminModal(false)} 
          onSuccess={(msg) => { setToast({ message: msg }); handleInteraction(); }} 
        />
      )}
      <Footer />
    </div>
  );
};

export default Dashboard;
