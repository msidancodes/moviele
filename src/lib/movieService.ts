import axios from "axios";
import { normalizeTitle, selectDailyMovie } from "./gameLogic";

export interface Movie {
  id: string | number;
  title: string;
  normalizedTitle: string;
  posterPath: string | null;
  year: string;
  language: string;
  rating: number;
  overview: string;
}

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const MOCK_MOVIES: Movie[] = [
  { id: 1, title: "Inception", normalizedTitle: "INCEPTION", posterPath: null, year: "2010", language: "English", rating: 8.8, overview: "A thief who steals corporate secrets through the use of dream-sharing technology..." },
  { id: 2, title: "Parasite", normalizedTitle: "PARASITE", posterPath: null, year: "2019", language: "Korean", rating: 8.5, overview: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan." },
  { id: 3, title: "The Matrix", normalizedTitle: "THEMATRIX", posterPath: null, year: "1999", language: "English", rating: 8.7, overview: "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth..." },
  { id: 4, title: "Spirited Away", normalizedTitle: "SPIRITEDAWAY", posterPath: null, year: "2001", language: "Japanese", rating: 8.6, overview: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits..." },
  { id: 5, title: "Dangal", normalizedTitle: "DANGAL", posterPath: null, year: "2016", language: "Hindi", rating: 8.3, overview: "Former wrestler Mahavir Singh Phogat and his two wrestler daughters struggle towards glory at the Commonwealth Games in the face of societal oppression." },
  { id: 6, title: "RRR", normalizedTitle: "RRR", posterPath: null, year: "2022", language: "Telugu", rating: 7.8, overview: "A fictitious story about two legendary revolutionaries and their journey away from home before they started fighting for their country in 1920's India." },
  { id: 7, title: "Kantara", normalizedTitle: "KANTARA", posterPath: null, year: "2022", language: "Kannada", rating: 8.2, overview: "When greed paves the way for betrayal, scheming and murder, a young tribal reluctantly dons the traditions of his ancestors to seek justice." },
  { id: 8, title: "Vikram", normalizedTitle: "VIKRAM", posterPath: null, year: "2022", language: "Tamil", rating: 8.3, overview: "A special investigator is assigned a case of serial killings, he finds the case is not what it seems to be, and leading down this path is only going to end in a war between everyone involved." },
  { id: 9, title: "Premam", normalizedTitle: "PREMAM", posterPath: null, year: "2015", language: "Malayalam", rating: 8.3, overview: "George, a teenager, loves a girl who doesn't reciprocate his feelings. Years later, he falls for a college lecturer but a tragedy turns his life upside down." },
  { id: 10, title: "Titanic", normalizedTitle: "TITANIC", posterPath: null, year: "1997", language: "English", rating: 7.9, overview: "101-year-old Rose DeWitt Bukater tells the story of her life aboard the Titanic..." },
];

export class MovieService {
  private memoryCache: Map<string, Movie> = new Map();

  async getDailyMovie(date: string): Promise<Movie> {
    if (!TMDB_API_KEY) {
      return selectDailyMovie(MOCK_MOVIES, date);
    }
    
    // In a real app we might fetch a specific list or page based on the date.
    // To ensure consistency across calls for the same date without state, 
    // we'll fetch page 1 of top rated movies and select deterministically.
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/movie/top_rated`, {
        params: { api_key: TMDB_API_KEY, language: 'en-US', page: 1 }
      });
      
      const movies = response.data.results.map(this.mapTmdbToMovie);
      // Filter out movies with too short/long titles, or zero length after normalization
      const validMovies = movies.filter((m: Movie) => m.normalizedTitle.length >= 3 && m.normalizedTitle.length <= 15);
      
      if (validMovies.length === 0) return selectDailyMovie(MOCK_MOVIES, date);
      
      return selectDailyMovie(validMovies, date);
    } catch (e) {
      console.error("TMDB error daily movie:", e);
      return selectDailyMovie(MOCK_MOVIES, date);
    }
  }

  async getRandomMovie(): Promise<Movie> {
    if (!TMDB_API_KEY) {
      return MOCK_MOVIES[Math.floor(Math.random() * MOCK_MOVIES.length)];
    }

    try {
      // Pick a random page from 1 to 20
      const page = Math.floor(Math.random() * 20) + 1;
      const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
        params: { api_key: TMDB_API_KEY, language: 'en-US', page }
      });
      
      const movies = response.data.results.map(this.mapTmdbToMovie);
      const validMovies = movies.filter((m: Movie) => m.normalizedTitle.length >= 3 && m.normalizedTitle.length <= 15);
      
      if (validMovies.length === 0) {
        return MOCK_MOVIES[Math.floor(Math.random() * MOCK_MOVIES.length)];
      }

      return validMovies[Math.floor(Math.random() * validMovies.length)];
    } catch (e) {
      console.error("TMDB error random movie:", e);
      return MOCK_MOVIES[Math.floor(Math.random() * MOCK_MOVIES.length)];
    }
  }

  cacheRandomMovie(seed: string, movie: Movie) {
    this.memoryCache.set(seed, movie);
  }

  getCachedRandomMovie(seed: string): Movie | undefined {
    return this.memoryCache.get(seed);
  }

  async validateMovieGuess(normalizedGuess: string): Promise<boolean> {
    if (!TMDB_API_KEY) {
      // Without API, just accept any length-matching guess, or strictly check mock.
      // Strict mock check might be too hard for players guessing real movies not in mock DB, 
      // but let's do a strict check on mock DB + relaxed if they just want to play.
      // Actually wordle requires valid words. We'll accept if it matches our regex.
      // Since it's mock mode, we'll allow any guess to keep it playable.
      return true;
    }

    // With TMDB, search for the movie.
    try {
      // This might be slightly slow for every guess, but acceptable for this demo.
      const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
        params: { api_key: TMDB_API_KEY, query: normalizedGuess, language: 'en-US', page: 1 }
      });

      const results = response.data.results;
      for (const result of results) {
        if (normalizeTitle(result.title) === normalizedGuess || normalizeTitle(result.original_title || "") === normalizedGuess) {
          return true;
        }
      }
      return false; // Not found as an exact title
    } catch (e) {
      console.error("TMDB search error:", e);
      return true; // Fallback to allowing it if API fails
    }
  }

  private mapTmdbToMovie(tmdbMovie: any): Movie {
    return {
      id: tmdbMovie.id,
      title: tmdbMovie.title,
      normalizedTitle: normalizeTitle(tmdbMovie.title),
      posterPath: tmdbMovie.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}` : null,
      year: tmdbMovie.release_date ? tmdbMovie.release_date.substring(0, 4) : "Unknown",
      language: tmdbMovie.original_language ? tmdbMovie.original_language.toUpperCase() : "Unknown",
      rating: tmdbMovie.vote_average,
      overview: tmdbMovie.overview,
    };
  }
}
