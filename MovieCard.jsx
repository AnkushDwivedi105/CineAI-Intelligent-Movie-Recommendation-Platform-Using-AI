import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import { playSound } from '../utils/soundUtils';

const MovieCard = ({ movie, onPlay, onInteraction, onDelete, searchTag }) => {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [userRating, setUserRating] = useState(movie.user_rating || null);
  const [isFavorite, setIsFavorite] = useState(movie.is_favorite || false);
  const [hoverRating, setHoverRating] = useState(0);
  const [isRatingSuccess, setIsRatingSuccess] = useState(false);
  const [isFavoritePop, setIsFavoritePop] = useState(false);

  // Reset when movie changes
  useEffect(() => {
    setUserRating(movie.user_rating || null);
    setIsFavorite(movie.is_favorite || false);
  }, [movie.id, movie.user_rating, movie.is_favorite]);

  // Premium gradient fallback
  const placeholderStyle = useMemo(() => {
    const colors = [
      ['#FF3366', '#2D0B5A'],
      ['#00C6FF', '#0072FF'],
      ['#f953c6', '#b91d73'],
      ['#F00000', '#DC281E'],
      ['#1f4037', '#99f2c8'],
    ];
    const hash = (movie.title || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const pair = colors[hash % colors.length];
    return { background: `linear-gradient(135deg, ${pair[0]} 0%, ${pair[1]} 100%)` };
  }, [movie.title]);

  const displayPoster = movie.poster_url;

  const handleRate = async (e, score) => {
    e.stopPropagation();
    e.preventDefault();
    setUserRating(score);
    setIsRatingSuccess(true);
    playSound('success');
    setTimeout(() => setIsRatingSuccess(false), 1000);
    try {
      const res = await api.post('/movies/rate', {
        movie_id: movie.id,
        rating: score,
        title: movie.title,
        poster_url: movie.poster_url,
        genres: movie.genres,
        tmdb_id: movie.tmdb_id || null
      });
      console.log('Rating saved:', res.data);
      if (onInteraction) onInteraction();
    } catch (err) {
      console.error('Rating failed:', err.response?.data || err.message);
      setUserRating(movie.user_rating || null); // Revert on fail
    }
  };

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    const newState = !isFavorite;
    setIsFavorite(newState);
    setIsFavoritePop(true);
    playSound(newState ? 'pop' : 'click');
    setTimeout(() => setIsFavoritePop(false), 800);
    try {
      const res = await api.post('/movies/favorites/toggle', {
        movie_id: movie.id,
        title: movie.title,
        poster_url: movie.poster_url,
        genres: movie.genres,
        tmdb_id: movie.tmdb_id || null
      });
      console.log('Favorite toggled:', res.data);
      if (onInteraction) onInteraction();
    } catch (err) {
      console.error('Favorite failed:', err.response?.data || err.message);
      setIsFavorite(!newState); // Revert on fail
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, scale: 1.04 }}
      onMouseEnter={() => {
        setIsHovered(true);
        // Pre-fetch/Resolve TMDB ID for instant play
        if (!movie.tmdb_id && movie.id) {
          api.get(`/movies/${movie.id}/live`).catch(() => {});
        }
      }}
      onMouseLeave={() => { setIsHovered(false); setHoverRating(0); }}
      className="group relative aspect-[2/3] w-full rounded-2xl overflow-hidden cursor-pointer shadow-2xl bg-bg-dark border border-white/5"
      onClick={() => {
        playSound('click');
        onPlay && onPlay(movie);
      }}
    >
      {/* Success Glow on Rating */}
      {isRatingSuccess && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.4, 0] }}
          className="absolute inset-0 bg-yellow-400/20 z-20 pointer-events-none"
        />
      )}
      {/* Poster Image */}
      <div className="absolute inset-0">
        {displayPoster && !imgError ? (
          <img
            src={displayPoster}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-between p-6 text-center bg-mesh" style={placeholderStyle}>
            <div className="mt-10">
              <div className="text-5xl mb-4 animate-bounce">🎬</div>
              <div className="h-1 w-12 bg-white/20 mx-auto rounded-full" />
            </div>
            <div className="mb-6">
              <p className="text-white font-black text-xs uppercase tracking-widest line-clamp-2 px-2">
                {(movie.title || '').split('(')[0].trim()}
              </p>
              <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.2em] mt-2">
                No Poster Available
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Search Tag Badge */}
      {searchTag && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 p-2">
          <div className="bg-brand/90 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-white/20 shadow-2xl transform -rotate-12 scale-110">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
              {searchTag}
            </p>
          </div>
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-white font-black text-sm leading-tight uppercase tracking-tight mb-1 line-clamp-2">
            {(movie.title || '').split('(')[0].trim()}
          </h3>
          <p className="text-brand text-[9px] font-black tracking-[0.2em] uppercase mb-3">
            {movie.genres ? movie.genres.split('|')[0] : 'Movie'}
          </p>

          {/* ⭐ Star Rating */}
          <div
            className={`flex items-center gap-1 mb-3 transition-all duration-300 ${isRatingSuccess ? 'scale-110' : ''}`}
            onClick={e => e.stopPropagation()}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => {
                  setHoverRating(star);
                  playSound('hover');
                }}
                onMouseLeave={() => setHoverRating(0)}
                onClick={(e) => handleRate(e, star)}
                className={`text-xl transition-all duration-150 hover:scale-125 active:scale-110 ${
                  (hoverRating || userRating) >= star
                    ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,1)]'
                    : 'text-white/25 hover:text-yellow-400/60'
                }`}
              >
                ★
              </button>
            ))}
            {userRating && (
              <span className="text-yellow-400 text-[10px] font-bold ml-1 animate-bounce">
                {userRating}/5
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                playSound('click');
                onPlay && onPlay(movie); 
              }}
              className="flex-1 bg-white text-black py-2 rounded-lg font-black text-[10px] uppercase tracking-wider hover:bg-brand hover:text-white transition-all transform active:scale-90"
            >
              ▶ Play
            </button>
            <motion.button
              onClick={toggleFavorite}
              animate={isFavoritePop ? { scale: [1, 1.4, 1] } : {}}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-base transition-all duration-200 ${
                isFavorite
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : 'bg-white/15 hover:bg-red-500/20 hover:text-red-400 text-white'
              }`}
              title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              {isFavorite ? '❤️' : '🤍'}
            </motion.button>
          </div>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                playSound('pop');
                onDelete(movie.id);
              }}
              className="mt-2 w-full bg-red-500/20 text-red-400 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-wider hover:bg-red-500/40 transition-all border border-red-500/30"
            >
              🗑️ Delete Movie
            </button>
          )}
        </div>
      </div>

      {/* Favorite badge (always visible) */}
      {isFavorite && (
        <div className="absolute top-2 right-2 text-lg drop-shadow-lg pointer-events-none z-10">
          ❤️
        </div>
      )}
      {/* Rating badge */}
      {userRating && (
        <div className="absolute top-2 left-2 bg-yellow-400/90 text-black text-[9px] font-black px-2 py-0.5 rounded-full pointer-events-none z-10">
          ★ {userRating}
        </div>
      )}
    </motion.div>
  );
};

export default MovieCard;
