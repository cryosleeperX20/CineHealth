const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w300';

export const getMoviePoster = async (title) => {
  try {
    // Clean title — remove year like "(1995)"
    const cleanTitle = title.replace(/\s*\(\d{4}\)\s*$/, '').trim();
    
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}`
    );
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const poster = data.results[0].poster_path;
      return poster ? `${TMDB_IMAGE_BASE}${poster}` : null;
    }
    return null;
  } catch (err) {
    return null;
  }
};
