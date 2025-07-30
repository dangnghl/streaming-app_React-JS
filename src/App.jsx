import { useEffect, useState } from 'react'
import Search from './components/Search';
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import {useDebounce} from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite';

const POSTER_BASE_URL = 'https://media.themoviedb.org/t/p/w300_and_h450_bestv2';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};    

const App = () => {
  const [searchTerm,setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('')
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [debouncedSearchTerm, setdebouncedSearchTerm] = useState('')
  
  // Debounce the search term to avoid too many API calls
  useDebounce(() => setdebouncedSearchTerm(searchTerm),
  500, [searchTerm]);

  // Function to fetch movies from the API
  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const endpoint = query
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);
      
      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }
      //await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      const data = await response.json();

      if (data.Response === 'False') {
        setErrorMessage(data.Error || 'An error occurred while fetching movies.');
        return;
      }

      setMovieList(data.results || []);

      if (query && data.results.length > 0) {
        
        await updateSearchCount(query,data.results[0]); //update database with search count
      }

    } catch (error) {
      console.error('Error fetching movies:', error);
      setErrorMessage('Failed to fetch movies. Please try again later.');
    }finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
      console.log('Trending Movies:', trendingMovies);
      
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      
    }
  }

  useEffect(() => {
    loadTrendingMovies();
  
  }, [])
  

  // Fetch movies when the component mounts or when the debounced search term changes
  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm])


  return (
    <main>
      <div className='pattern'/>
      <div className='wrapper'>
        <header>
          <img src="./hero.png" alt="hero" />
          <h1 className=''> Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle </h1>
          <Search placeholder={`search through thousands of movies`} searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            
            <ul>
              {trendingMovies.map((movie,index) => (
                <li key={index} className='select-none'>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
              
          </section>
        )}

        <section className='all-movies'>
          <h2>All Movies</h2>
          {isLoading ?
            (<Spinner/>)
            : errorMessage ? 
              (<p className='text-red-500'>{errorMessage}</p>)
              : (
                <ul>
                {
                  movieList.map((movie) => (
                    <MovieCard key={movie.id} movie={movie}/>
                  ))
                }
                </ul>
              )
          }

          
        </section>

      </div>

    </main>
  )
}

export default App;