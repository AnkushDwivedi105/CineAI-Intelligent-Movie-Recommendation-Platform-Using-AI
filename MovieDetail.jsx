import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import PlayerModal from '../components/PlayerModal';

/* ── helpers ─────────────────────────────────────────────────────────── */
const FALLBACK_POSTERS = [
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=500&h=750",
  "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&q=80&w=500&h=750",
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=500&h=750",
  "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=500&h=750",
  "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=500&h=750",
];

const StarRating = ({ score }) => {
  const pct = Math.round((score / 10) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ position: 'relative', width: 120, height: 20 }}>
        {/* background */}
        <div style={{ position: 'absolute', inset: 0, color: '#333', fontSize: 20, letterSpacing: 2 }}>★★★★★</div>
        {/* fill */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', width: `${pct}%`, color: '#f5c518', fontSize: 20, letterSpacing: 2 }}>★★★★★</div>
      </div>
      <span style={{ color: '#f5c518', fontWeight: 700, fontSize: '1.1rem' }}>{score?.toFixed(1)}</span>
      <span style={{ color: '#888', fontSize: '0.85rem' }}>/10</span>
    </div>
  );
};

/* ── Interactive Rating Component ────────────────────────────────────── */
const InteractiveStars = ({ initialRating, onRate }) => {
  const [hover, setHover] = useState(0);
  const [rating, setRating] = useState(initialRating || 0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialRating) setRating(initialRating);
  }, [initialRating]);

  const handleClick = async (val) => {
    setSaving(true);
    try {
      await onRate(val);
      setRating(val);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ marginTop: '1.5rem', padding: '1.2rem', background: '#1a1a1a', borderRadius: 12, border: '1px solid #333', maxWidth: 350 }}>
      <p style={{ margin: '0 0 0.8rem', fontSize: '0.9rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
        {rating > 0 ? 'Your Rating' : 'Rate this Movie'}
      </p>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        {[...Array(10)].map((_, i) => {
          const val = i + 1;
          const active = (hover || rating) >= val;
          return (
            <span
              key={val}
              onMouseEnter={() => setHover(val)}
              onMouseLeave={() => setHover(0)}
              onClick={() => handleClick(val)}
              style={{
                fontSize: '1.8rem',
                cursor: saving ? 'default' : 'pointer',
                color: active ? '#e50914' : '#333',
                transition: 'transform 0.1s, color 0.1s',
                transform: hover === val ? 'scale(1.3)' : 'none',
              }}
            >
              ★
            </span>
          );
        })}
      </div>
      {saving && <p style={{ fontSize: '0.75rem', color: '#e50914', marginTop: '0.5rem', margin: 0 }}>Saving...</p>}
    </div>
  );
};

/* ── Trailer Modal ───────────────────────────────────────────────────── */
const TrailerModal = ({ trailerKey, onClose }) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
  >
    <div onClick={e => e.stopPropagation()} style={{ width: '90vw', maxWidth: 900 }}>
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
        <iframe
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: 12, border: 'none' }}
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="Movie Trailer"
        />
      </div>
      <button
        onClick={onClose}
        style={{
          marginTop: '1rem', display: 'block', marginLeft: 'auto',
          background: 'transparent', border: '1px solid #555', color: '#ccc',
          padding: '0.4rem 1.2rem', borderRadius: 8, cursor: 'pointer',
        }}
      >✕ Close</button>
    </div>
  </div>
);


/* ── Main Page ───────────────────────────────────────────────────────── */
const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [imgError, setImgError]     = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showPlayer, setShowPlayer]   = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setImgError(false);
    api.get(`/movies/${id}/live`)
      .then(res => setMovie(res.data))
      .catch(err => {
        console.error('MovieDetail fetch error:', err);
        // fallback: try plain movie endpoint
        return api.get(`/movies/${id}`).then(res => setMovie(res.data));
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0e0e0e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 60, height: 60, border: '4px solid #333', borderTop: '4px solid #e50914',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem',
        }} />
        <p style={{ color: '#888', fontSize: '1rem' }}>Fetching live movie data…</p>
      </div>
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
    </div>
  );

  if (!movie) return (
    <div style={{ minHeight: '100vh', background: '#0e0e0e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Movie not found.</p>
        <button onClick={() => navigate('/dashboard')} style={btnStyle('#e50914')}>← Back to Dashboard</button>
      </div>
    </div>
  );

  const fallback = FALLBACK_POSTERS[(movie.id || 0) % FALLBACK_POSTERS.length];
  const poster   = (!movie.poster_url || imgError) ? fallback : movie.poster_url;
  const year     = movie.release_date ? movie.release_date.slice(0, 4) : '';
  const genres   = movie.genres ? movie.genres.split('|') : [];
  const runtime  = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null;

  return (
    <div style={{ minHeight: '100vh', background: '#0e0e0e', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap" rel="stylesheet" />

      {/* ── Backdrop Hero ─────────────────────────────────────────── */}
      <div style={{ position: 'relative', width: '100%', height: '60vh', overflow: 'hidden' }}>
        {movie.backdrop_url ? (
          <img src={movie.backdrop_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35)' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a1a2e,#16213e,#0e0e0e)' }} />
        )}
        {/* gradient fade at bottom */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, #0e0e0e 100%)' }} />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute', top: 24, left: 24, background: 'rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.5rem 1.2rem',
            borderRadius: 8, cursor: 'pointer', fontSize: '0.9rem', backdropFilter: 'blur(8px)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(229,9,20,0.8)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
        >← Back</button>
      </div>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '-180px auto 0', padding: '0 2rem 4rem', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Poster */}
          <div style={{ flexShrink: 0 }}>
            <img
              src={poster}
              alt={movie.title}
              onError={() => setImgError(true)}
              style={{
                width: 240, height: 360, objectFit: 'cover', borderRadius: 12,
                boxShadow: '0 24px 60px rgba(0,0,0,0.9)',
                border: '2px solid rgba(255,255,255,0.08)',
              }}
            />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 280, paddingTop: '4rem' }}>
            {/* Title */}
            <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, margin: '0 0 0.5rem', lineHeight: 1.1 }}>
              {movie.title}
            </h1>

            {/* Meta: year · runtime · rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {year    && <span style={metaTag('#333')}>{year}</span>}
              {runtime && <span style={metaTag('#333')}>{runtime}</span>}
              {movie.vote_average && <StarRating score={movie.vote_average} />}
            </div>

            {/* Genres */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {genres.map(g => (
                <span key={g} style={metaTag('#e50914', true)}>{g}</span>
              ))}
            </div>

            {/* Overview */}
            {movie.overview ? (
              <p style={{ color: '#ccc', lineHeight: 1.75, fontSize: '1rem', maxWidth: 600, marginBottom: '1.75rem' }}>
                {movie.overview}
              </p>
            ) : (
              <p style={{ color: '#555', fontStyle: 'italic', marginBottom: '1.75rem' }}>
                No synopsis available.
              </p>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {movie.tmdb_id && (
                <button
                  onClick={() => setShowPlayer(true)}
                  style={btnStyle('#e50914')}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  🚀 Watch Now (Full Movie)
                </button>
              )}
              {movie.trailer_key && (
                <button
                  onClick={() => setShowTrailer(true)}
                  style={{ ...btnStyle('#1a1a1a'), border: '1px solid #333' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#222'}
                  onMouseLeave={e => e.currentTarget.style.background = '#1a1a1a'}
                >
                  ▶ Play Trailer
                </button>
              )}
              {movie.tmdb_url && (
                <a
                  href={movie.tmdb_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...btnStyle('transparent'), border: '1px solid #555', textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#222'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  🎬 View on TMDB
                </a>
              )}
            </div>

            {/* User Rating */}
            <InteractiveStars 
              initialRating={movie.user_rating ? movie.user_rating * 2 : 0} 
              onRate={async (val) => {
                await api.post('/movies/rate', { movie_id: movie.id, rating: val });
              }}
            />
          </div>
        </div>

        {/* ── Cast ──────────────────────────────────────────────── */}
        {movie.cast && movie.cast.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem', color: '#eee' }}>Top Cast</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
              {movie.cast.map((actor, i) => (
                <div key={i} style={{
                  background: '#1a1a1a', borderRadius: 10, overflow: 'hidden',
                  border: '1px solid #2a2a2a', transition: 'transform 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  {actor.profile_path ? (
                    <img src={actor.profile_path} alt={actor.name} style={{ width: '100%', height: 150, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: 150, background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                      🎭
                    </div>
                  )}
                  <div style={{ padding: '0.6rem 0.75rem' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: 0, color: '#fff' }}>{actor.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#888', margin: '0.2rem 0 0' }}>{actor.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── No TMDB data notice ─────────────────────────────── */}
        {!movie.overview && !movie.cast?.length && (
          <div style={{
            marginTop: '2rem', padding: '1.5rem', borderRadius: 12,
            background: 'linear-gradient(90deg, #1a1a1a, #0e0e0e)', border: '1px solid #333', textAlign: 'center',
          }}>
            <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>
              💡 Metadata (descriptions, cast) is hidden. Set <code style={{ color: '#e50914', background: '#222', padding: '2px 6px', borderRadius: 4 }}>TMDB_API_KEY</code> in your server .env to enable it.{' '}
              <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" style={{ color: '#e50914', textDecoration: 'none', fontWeight: 600 }}>
                Get Key →
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showTrailer && movie.trailer_key && (
        <TrailerModal trailerKey={movie.trailer_key} onClose={() => setShowTrailer(false)} />
      )}
      {showPlayer && movie.tmdb_id && (
        <PlayerModal tmdbId={movie.tmdb_id} imdbId={movie.imdb_id} onClose={() => setShowPlayer(false)} />
      )}
    </div>
  );
};

/* ── Shared styles ───────────────────────────────────────────────────── */
const btnStyle = (bg) => ({
  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
  background: bg, color: '#fff', border: 'none', borderRadius: 8,
  padding: '0.65rem 1.4rem', fontWeight: 700, fontSize: '0.95rem',
  cursor: 'pointer', transition: 'background 0.2s, transform 0.1s',
});

const metaTag = (bg, small = false) => ({
  background: bg, color: small ? '#fff' : '#ccc',
  padding: small ? '0.25rem 0.75rem' : '0.2rem 0.6rem',
  borderRadius: small ? 20 : 4, fontSize: small ? '0.8rem' : '0.85rem', fontWeight: small ? 700 : 400,
});

export default MovieDetail;
