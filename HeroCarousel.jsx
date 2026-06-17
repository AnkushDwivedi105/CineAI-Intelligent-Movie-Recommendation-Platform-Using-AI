import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { playSound } from '../utils/soundUtils';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const HeroCarousel = ({ movies, loading, onPlay, onInteraction }) => {
  const [favoriteStates, setFavoriteStates] = useState({}); // {tmdb_id: bool}
  const [ratingStates, setRatingStates] = useState({}); // {tmdb_id: number}
  const [isPop, setIsPop] = useState(null); // tmdb_id

  const handleRate = async (movie, score) => {
    playSound('success');
    setRatingStates(prev => ({ ...prev, [movie.tmdb_id]: score }));
    try {
      await api.post('/movies/rate', {
        movie_id: movie.id,
        rating: score,
        title: movie.title,
        tmdb_id: movie.tmdb_id,
        poster_url: movie.poster_url,
        genres: movie.genres
      });
      if (onInteraction) onInteraction();
    } catch (e) { console.error(e); }
  };

  const toggleFavorite = async (movie) => {
    const newState = !favoriteStates[movie.tmdb_id];
    setFavoriteStates(prev => ({ ...prev, [movie.tmdb_id]: newState }));
    setIsPop(movie.tmdb_id);
    playSound(newState ? 'pop' : 'click');
    setTimeout(() => setIsPop(null), 600);
    try {
      await api.post('/movies/favorites/toggle', {
        movie_id: movie.id,
        title: movie.title,
        tmdb_id: movie.tmdb_id,
        poster_url: movie.poster_url,
        genres: movie.genres
      });
      if (onInteraction) onInteraction();
    } catch (e) { console.error(e); }
  };

  if (loading || !movies || movies.length === 0) {
    return (
      <div className="h-[80vh] w-full bg-white/5 animate-pulse mb-16 rounded-[2.5rem]" />
    );
  }

  return (
    <div className="relative h-[85vh] w-full mb-20 group overflow-hidden rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        speed={1200}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true, dynamicBullets: true }}
        navigation={true}
        loop={true}
        className="h-full w-full"
      >
        {movies.map((movie, index) => (
          <SwiperSlide key={movie.tmdb_id || index}>
            {({ isActive }) => (
              <div className="relative h-full w-full overflow-hidden">
                {/* Backdrop Image */}
                <motion.div 
                  initial={{ scale: 1.1 }}
                  animate={{ scale: isActive ? 1 : 1.1 }}
                  transition={{ duration: 6, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <img 
                    src={movie.backdrop_url || movie.poster_url || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1600"} 
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-bg-dark/80 via-transparent to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-0 flex items-center px-12 md:px-24 pt-20">
                  <div className="max-w-5xl z-10">
                    <AnimatePresence mode="wait">
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                        >
                          <div className="flex items-center gap-4 mb-6">
                            <span className="bg-brand text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-brand/20">
                              {movie.is_trending ? 'Trending Now' : 'Featured Movie'}
                            </span>
                            {movie.vote_average && (
                              <div className="glass-card px-3 py-1 rounded-full flex items-center gap-1.5 border-white/10">
                                <span className="text-yellow-400 text-sm">★</span>
                                <span className="text-white text-sm font-bold">{movie.vote_average.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                          
                          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[0.9] tracking-[-0.04em] drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)] uppercase max-w-4xl">
                            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">
                              {movie.title.split('(')[0]}
                            </span>
                          </h1>
                          
                          <p className="text-white/70 text-lg md:text-xl mb-10 line-clamp-3 leading-relaxed max-w-2xl font-medium drop-shadow-md">
                            {movie.overview || "Experience the ultimate cinematic journey. Discover world-class storytelling and breathtaking visuals in this highly-rated masterpiece."}
                          </p>

                          <div className="flex flex-wrap items-center gap-6">
                            <button 
                              onClick={() => {
                                playSound('click');
                                onPlay(movie);
                              }}
                              className="bg-white text-bg-dark font-black px-12 py-5 rounded-2xl hover:bg-brand hover:text-white transition-all transform active:scale-95 flex items-center gap-3 shadow-2xl text-lg group/btn"
                            >
                              <span className="text-2xl group-hover/btn:scale-125 transition-transform">▶</span> Watch Now
                            </button>

                            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/10">
                              <div className="flex items-center gap-1 px-4 border-r border-white/10">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <button
                                    key={star}
                                    onClick={() => handleRate(movie, star)}
                                    className={`text-2xl transition-all hover:scale-125 ${
                                      (ratingStates[movie.tmdb_id] || 0) >= star ? 'text-yellow-400' : 'text-white/20'
                                    }`}
                                  >★</button>
                                ))}
                              </div>
                              <motion.button
                                onClick={() => toggleFavorite(movie)}
                                animate={isPop === movie.tmdb_id ? { scale: [1, 1.4, 1] } : {}}
                                className={`w-12 h-12 flex items-center justify-center text-2xl rounded-xl transition-all ${
                                  favoriteStates[movie.tmdb_id] ? 'bg-red-500 text-white shadow-lg shadow-red-500/40' : 'bg-white/5 text-white/40 hover:bg-white/10'
                                }`}
                              >
                                {favoriteStates[movie.tmdb_id] ? '❤️' : '🤍'}
                              </motion.button>
                            </div>

                            <Link 
                              to={movie.id ? `/movie/${movie.id}` : '#'} 
                              onClick={() => playSound('click')}
                              className="glass-card text-white font-bold px-10 py-5 rounded-2xl hover:bg-white/10 transition-all flex items-center gap-3 text-lg border border-white/5"
                            >
                              ⓘ More Info
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Bottom Shine */}
                <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-bg-dark to-transparent pointer-events-none" />
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Styles for Swiper Pagination */}
      <style jsx="true">{`
        .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.3) !important;
          width: 12px !important;
          height: 12px !important;
          opacity: 1 !important;
        }
        .swiper-pagination-bullet-active {
          background: #8B5CF6 !important; /* Brand Purple */
          width: 32px !important;
          border-radius: 6px !important;
        }
        .swiper-button-next, .swiper-button-prev {
          color: white !important;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          width: 60px !important;
          height: 60px !important;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          opacity: 0;
          transition: all 0.3s ease;
        }
        .swiper-button-next:after, .swiper-button-prev:after {
          font-size: 20px !important;
          font-weight: 900;
        }
        .group:hover .swiper-button-next, .group:hover .swiper-button-prev {
          opacity: 1;
        }
        .swiper-button-next:hover, .swiper-button-prev:hover {
          background: #8B5CF6;
          border-color: #8B5CF6;
        }
      `}</style>
    </div>
  );
};

export default HeroCarousel;
