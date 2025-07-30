import React from 'react'

const POSTER_BASE_URL = 'https://media.themoviedb.org/t/p/w300_and_h450_bestv2';

const MovieCard = ({movie: {title,poster_path,vote_average,original_language,release_date}}) => {
  return (
    <div className='movie-card'>
        <img src={poster_path ? `${POSTER_BASE_URL}/${poster_path}`:'./no-movie.png'}  />
        
        <div className='mt-4'>
            <h3 className='text-white'>{title}</h3>
            <div className='content'>
                <div className="rating">
                    <img src="star.svg" alt="Star Icon" />
                    <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>

                    <span>•</span>
                    <p className="lang">{original_language}</p>
                    <span>•</span>
                    <p className="year">{release_date.split('-')[0]}</p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default MovieCard