// const axios = require('axios').default;
// import axios from'axios';


//Data 

const api = axios.create({
    baseURL: 'https://api.themoviedb.org/3/',
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    },
    params: {
        'api_key': API_KEY,
    }
});


function likedMoviesList() {
    const item = JSON.parse(localStorage.getItem('liked_movies'));
    let movies;

    if(item) {
        movies = item;
    }
    else {
        movies = {}
    }
    return movies;
}
function likeMovie(movie) {

    const likedMovies = likedMoviesList();

    if (likedMovies[movie.id]) {
        console.log('La pelicla esta en Ls, eliminar');
         likedMovies[movie.id] = undefined;
    } else {
        console.log('La pelicla no esta en Ls, agregar');
         likedMovies[movie.id] = movie;
    }
    localStorage.setItem('liked_movies', JSON.stringify(likedMovies));
}

// utils

const lazyLoader = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if(entry.isIntersecting) {
            const url = entry.target.getAttribute('data-img');
            // const url = movieImg.getAttribute('data-img',)
            entry.target.setAttribute('src', url);
        }
    });
}); 

function createMovies(
    movies, 
    container, 
    {   lazyLoad = false, 
        clean = true 
    } = {}, 
    ) {
    if (clean) {
        container.innerHTML = '';
    }

    movies.forEach(movie => {
        // const categoriesPreviewList = document.querySelector('#trendingPreview .trendingPreview-movieList');
        const movieContainer = document.createElement('div');
        movieContainer.classList.add('movie-container');
        // movieContainer.addEventListener('click', () => {
        //     location.hash = '#movie='+ movie.id;
        // });

        const movieImg = document.createElement('img');
        movieImg.classList.add('movie-img');
        movieImg.setAttribute('alt', movie.title);
        movieImg.setAttribute(
            lazyLoad ? 'data-img': 'src',
            'https://image.tmdb.org/t/p/w300/'+ movie.poster_path
        );
        movieImg.addEventListener('click', () => {
            location.hash = '#movie='+ movie.id;
        });
        movieImg.addEventListener('error', () => {
            movieImg.setAttribute('src',"https://image.tmdb.org/t/p/w300/adOzdWS35KAo21r9R4BuFCkLer6.jpg");
        });

        const movieBtn = document.createElement('button');
        movieBtn.classList.add('movie-btn');
        likedMoviesList()[movie.id] && movieBtn.classList.add('movie-btn--liked');
        movieBtn.addEventListener('click', () => {
            movieBtn.classList.toggle('movie-btn--liked')
            //agregar pelicula local storange
            likeMovie(movie);
        });

        if(lazyLoad) {
            lazyLoader.observe(movieImg);
        }

         movieContainer.appendChild(movieImg);
         movieContainer.appendChild(movieBtn);
         container.appendChild(movieContainer);
    });
}

function createCategories(categories, container) {
    container.innerHTML = "";

    categories.forEach(category => {
        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container');

        const categoryTitle = document.createElement('h3');
        categoryTitle.classList.add('category-title');
        categoryTitle.setAttribute('id','id'+category.id);
        categoryTitle.addEventListener('click', () => {
            location.hash = 'category='+ category.id + '-' +category.name;
        });
        const categoryTitleText = document.createTextNode(category.name);

        categoryTitle.appendChild(categoryTitleText);
        categoryContainer.appendChild(categoryTitle);
        container.appendChild(categoryContainer)

        });
}
//lamados a la API


async function getTreadingMoviesPreview() {
    const {data} = await api('trending/movie/day');
    const movies = data.results;

    createMovies(movies, trendingMoviesPreviewList, true);


    // console.log(data, movies);
    // trendingMoviesPreviewList.innerHTML = "";
    // movies.forEach(movie => {
    //     // const categoriesPreviewList = document.querySelector('#trendingPreview .trendingPreview-movieList');
    //     const movieContainer = document.createElement('div');
    //     movieContainer.classList.add('movie-container');

    //     const movieImg = document.createElement('img');
    //     movieImg.classList.add('movie-img');
    //     movieImg.setAttribute('alt', movie.title);
    //     movieImg.setAttribute('src',
    //      'https://image.tmdb.org/t/p/w300/'+ movie.poster_path);

    //      movieContainer.appendChild(movieImg);
    //      trendingMoviesPreviewList.appendChild(movieContainer);
    // });
}

// asd
async function getCategoriesPreview() {
    const {data} = await api('genre/movie/list'); 
    //axio no neceisario mandas api key aqui
    //const data = await res.json(); en axios ne es necesario
    const categories = data.genres;
    // console.log(data, movies);
    // categoriesPreviewList.innerHTML = "";
    // const PreviewCategoriesContainer = document.querySelector('#categoriesPreview .categoriesPreview-list');

    // PreviewCategoriesContainer


        createCategories(categories, categoriesPreviewList);
}


// async function getMoviesBySearch(query) {
//     console.log("Hola");
//     const {data} = await api('search/movie', {
//         params: {
//             query,

//         },
//     });
//     console.log(data)
//     const movies = data.results;
//     console.log('error', movies);
//     createMovies(movies, genericSection);
// }

async function getMoviesBySearch(query) {
    const { data } = await api('search/movie', {
      params: {
        query,
      },
    });
    const movies = data.results;
    maxPage = data.total_pages;
    console.log(maxPage);

    createMovies(movies, genericSection);
  }

// getMoviesByCategory

async function getMoviesByCategory(id) {
    const {data} = await api('discover/movie', {
        params: {
            with_genres: id,
        },
    });
    const movies = data.results;

    maxPage = data.total_pages;
    createMovies(movies, genericSection, {lazyLoad: true});
}

function getPaginatedMoviesByCategory(id) {
    return async function () {
        const {
            scrollTop, 
            scrollHeight,
            clientHeight
        } = document.documentElement;
        const scrollIsBotton = (scrollTop + clientHeight) >= (scrollHeight -15)
        
        const pageIsNotMax = (page < maxPage);
        
        if (scrollIsBotton && pageIsNotMax) {
            page++;
            const {data} = await api('discover/movie', {
                params: {
                    with_genres: id,
                    page,
                },
            });
            const movies = data.results;
        
            createMovies(
                movies, 
                genericSection, 
                {lazyLoad: true, clean: false}
            );
        }
    }

    // const btnLoadMore = document.createElement('button');
    // btnLoadMore.innerText = 'Cargar más';
    // btnLoadMore.addEventListener('click', getPaginatedTreadingMovies)
    // genericSection.appendChild(btnLoadMore);
}

async function getTreadingMovies() {
    const {data} = await api('trending/movie/day');
    const movies = data.results;
    maxPage = data.total_pages;
    createMovies(movies, genericSection, {lazyLoad: true, clean: true});
    // const btnLoadMore = document.createElement('button');
    // btnLoadMore.innerText = 'Cargar más';
    // btnLoadMore.addEventListener('click', getPaginatedTreadingMovies)
    // genericSection.appendChild(btnLoadMore);
}
// let page = 1;

// window.addEventListener('scroll', getPaginatedTreadingMovies);


function getPaginatedMoviesBySearch(query) {
    return async function () {
        const {
            scrollTop, 
            scrollHeight,
            clientHeight
        } = document.documentElement;
        const scrollIsBotton = (scrollTop + clientHeight) >= (scrollHeight -15)
        
        const pageIsNotMax = (page < maxPage);
        
        if (scrollIsBotton && pageIsNotMax) {
            page++;
            const {data} = await api('search/movie', {
                params: {
                    query,
                    page,
                },
            });
            const movies = data.results;
        
            createMovies(
                movies, 
                genericSection, 
                {lazyLoad: true, clean: false}
            );
        }
    }

    // const btnLoadMore = document.createElement('button');
    // btnLoadMore.innerText = 'Cargar más';
    // btnLoadMore.addEventListener('click', getPaginatedTreadingMovies)
    // genericSection.appendChild(btnLoadMore);
}


async function getPaginatedTreadingMovies() {
    const {
        scrollTop, 
        scrollHeight,
        clientHeight
    } = document.documentElement;
    const scrollIsBotton = (scrollTop + clientHeight) >= (scrollHeight -15)
    
    const pageIsNotMax = (page < maxPage);
    
    if (scrollIsBotton && pageIsNotMax) {
        page++;
        const {data} = await api('trending/movie/day', {
            params: {
                page,
            },
        });
        const movies = data.results;
    
        createMovies(movies, 
            genericSection, 
            {lazyLoad: true, clean: false}
        );
    }

    // const btnLoadMore = document.createElement('button');
    // btnLoadMore.innerText = 'Cargar más';
    // btnLoadMore.addEventListener('click', getPaginatedTreadingMovies)
    // genericSection.appendChild(btnLoadMore);
}


async function getMovieById(movie_id) {
    const {data: movie} = await api('movie/'+ movie_id);
    
    const movieImgUrl =  'https://image.tmdb.org/t/p/w500/'+ movie.poster_path;
    headerSection.style.background = `url(${movieImgUrl})`;
    movieDetailTitle.textContent = movie.title;
    movieDetailDescription.textContent = movie.overview;
    movieDetailScore.textContent = movie.vote_average;

    createCategories(movie.genres, movieDetailCategoriesList);

    getRelatedMoviesId(movie_id)
}

async function getRelatedMoviesId(movie_id) {    
    const {data} = await api(`movie/${movie_id}/similar`);
    const relatedMovies = data.results;

    createMovies(relatedMovies, relatedMoviesContainer); 

}

function getLikedMovies() {
    const likedMovies = likedMoviesList();
    const moviesArray = Object.values(likedMovies);
    createMovies(
        moviesArray, 
        likedMoviesListArticle, 
        { lazyLoad: true, 
            clean: true 
        });
}