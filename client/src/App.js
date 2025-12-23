import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

function App() {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState('');
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [details, setDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    fetchGenres();
    fetchPopular(1);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (selectedGenre) {
      fetchByGenre(selectedGenre, 1);
    } else {
      fetchPopular(1);
    }
  }, [selectedGenre]);

  const fetchGenres = async () => {
    const res = await axios.get(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
    setGenres(res.data.genres);
  };

  const fetchPopular = async (pageNum = 1) => {
    const res = await axios.get(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${pageNum}`);
    setMovies(pageNum === 1 ? res.data.results : prev => [...prev, ...res.data.results]);
    setHasMore(res.data.page < res.data.total_pages);
    setPage(pageNum);
  };

  const fetchByGenre = async (genreId, pageNum = 1) => {
    const res = await axios.get(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${pageNum}`);
    setMovies(pageNum === 1 ? res.data.results : prev => [...prev, ...res.data.results]);
    setHasMore(res.data.page < res.data.total_pages);
    setPage(pageNum);
  };

  const searchMovies = async (e) => {
    e.preventDefault();
    if (!query) return selectedGenre ? fetchByGenre(selectedGenre, 1) : fetchPopular(1);
    const res = await axios.get(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`);
    setMovies(res.data.results);
    setHasMore(false);
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
    setPage(1);
    setHasMore(true);
  };

  const handleScroll = () => {
    if (!hasMore) return;
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
      const nextPage = page + 1;
      if (selectedGenre) {
        fetchByGenre(selectedGenre, nextPage);
      } else {
        fetchPopular(nextPage);
      }
    }
  };

  const openModal = async (movie) => {
    setSelectedMovie(movie);
    setShowModal(true);
    // Fetch details, credits, and videos
    const [detailsRes, creditsRes, videosRes] = await Promise.all([
      axios.get(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}`),
      axios.get(`${BASE_URL}/movie/${movie.id}/credits?api_key=${API_KEY}`),
      axios.get(`${BASE_URL}/movie/${movie.id}/videos?api_key=${API_KEY}`)
    ]);
    setDetails({
      ...detailsRes.data,
      cast: creditsRes.data.cast.slice(0, 5),
      trailer: videosRes.data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube')
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setDetails(null);
    setSelectedMovie(null);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div style={{ fontFamily: 'Montserrat, Arial, sans-serif', background: theme === 'dark' ? 'linear-gradient(135deg, #181818 60%, #222 100%)' : '#f5f5f5', minHeight: '100vh', color: theme === 'dark' ? '#fff' : '#222', paddingBottom: 40 }}>
      <h1 style={{ textAlign: 'center', color: '#e50914', fontWeight: 900, fontSize: 48, letterSpacing: 2, marginTop: 30, marginBottom: 10 }}>CineStream</h1>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <button onClick={toggleTheme} style={{ padding: '8px 18px', borderRadius: 20, border: 'none', background: '#e50914', color: '#fff', fontWeight: 700, cursor: 'pointer', marginRight: 10 }}>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
      <form onSubmit={searchMovies} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 30 }}>
        <select value={selectedGenre} onChange={handleGenreChange} style={{ padding: '12px 18px', borderRadius: 30, border: 'none', fontSize: 18, marginRight: 10, background: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#222' }}>
          <option value="">All Genres</option>
          {genres.map(genre => (
            <option key={genre.id} value={genre.id}>{genre.name}</option>
          ))}
        </select>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search movies..."
          style={{
            padding: '12px 18px',
            width: 320,
            borderRadius: '30px 0 0 30px',
            border: 'none',
            outline: 'none',
            fontSize: 18,
            background: theme === 'dark' ? '#333' : '#fff',
            color: theme === 'dark' ? '#fff' : '#222',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        />
        <button type="submit" style={{
          borderRadius: '0 30px 30px 0',
          padding: '12px 28px',
          background: 'linear-gradient(90deg, #e50914 60%, #b0060f 100%)',
          color: '#fff',
          border: 'none',
          fontWeight: 700,
          fontSize: 18,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          Search
        </button>
      </form>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '28px',
        justifyContent: 'center',
        padding: '0 40px'
      }}>
        {movies.map(movie => (
          <div
            key={movie.id}
            style={{
              background: theme === 'dark' ? 'rgba(34,34,34,0.95)' : '#fff',
              borderRadius: 18,
              overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
              transition: 'transform 0.2s',
              position: 'relative',
              cursor: 'pointer',
              minHeight: 420,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'stretch',
            }}
            onClick={() => openModal(movie)}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {movie.poster_path ? (
              <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} style={{ width: '100%', height: 320, objectFit: 'cover', borderBottom: '2px solid #e50914' }} />
            ) : (
              <div style={{ width: '100%', height: 320, background: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb' }}>No Image</div>
            )}
            <div style={{ padding: '18px 16px 12px 16px', flex: 1 }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 22, fontWeight: 700, color: theme === 'dark' ? '#fff' : '#222', textShadow: '0 2px 8px #e5091422' }}>{movie.title}</h3>
              <p style={{ fontSize: 15, color: '#e50914', margin: 0 }}>{movie.release_date}</p>
              <p style={{ fontSize: 15, color: '#bbb', marginTop: 8 }}>{movie.overview?.slice(0, 120) || 'No description available.'}{movie.overview && movie.overview.length > 120 ? '...' : ''}</p>
            </div>
          </div>
        ))}
      </div>
      {showModal && details && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }} onClick={closeModal}>
          <div style={{
            background: theme === 'dark' ? '#222' : '#fff',
            color: theme === 'dark' ? '#fff' : '#222',
            borderRadius: 20,
            padding: 32,
            minWidth: 340,
            maxWidth: 500,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            position: 'relative',
            cursor: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <button onClick={closeModal} style={{ position: 'absolute', top: 18, right: 18, background: '#e50914', color: '#fff', border: 'none', borderRadius: 16, padding: '6px 14px', fontWeight: 700, cursor: 'pointer' }}>Close</button>
            <h2 style={{ marginTop: 0 }}>{details.title}</h2>
            <p><b>Genres:</b> {details.genres.map(g => g.name).join(', ')}</p>
            <p><b>Rating:</b> {details.vote_average} / 10</p>
            <p><b>Release Date:</b> {details.release_date}</p>
            <p><b>Cast:</b> {details.cast.map(c => c.name).join(', ')}</p>
            <p style={{ marginTop: 12 }}>{details.overview}</p>
            {details.trailer && (
              <div style={{ marginTop: 18 }}>
                <b>Trailer:</b>
                <div style={{ marginTop: 8 }}>
                  <iframe
                    width="100%"
                    height="220"
                    src={`https://www.youtube.com/embed/${details.trailer.key}`}
                    title="Trailer"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
            <div style={{ marginTop: 18 }}>
              <a href={`https://www.themoviedb.org/movie/${details.id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#e50914', fontWeight: 700 }}>View on TMDB</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
