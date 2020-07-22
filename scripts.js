'use strict';

const STORE = [];

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

function getFilmsExpiringSoon() {
    fetch("https://unogs-unogs-v1.p.rapidapi.com/aaapi.cgi?q=get%3Aexp%3AUS&t=ns&st=adv&p=1&type=movie", {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "unogs-unogs-v1.p.rapidapi.com",
            "x-rapidapi-key": CONFIG_UNOGS_API_KEY
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => responseJson.ITEMS.forEach(item => getSingleFilmInfo(item.netflixid)))
    .catch(err => {
        console.log(err);
    });
}

function addGenreAndMovieToStore(genreName, movieObjectToStore) {
    const genreAlreadyInStore = STORE.some(el => el.genreName === genreName);

    if (!genreAlreadyInStore) {

        const newGenreObject = new Object();
        
        newGenreObject.id = cuid();
        newGenreObject.genreName = genreName;
        newGenreObject.moviesInGenre = [movieObjectToStore];

        STORE.push(newGenreObject);
    } else {
        
        const existingGenreObject = STORE.find(el => el.genreName === genreName);

        existingGenreObject.moviesInGenre.push([movieObjectToStore]);
    }
}

function addRecordToStoreByGenres(genres, movie) {
    if (movie.nfinfo.type === "movie") {
        const movieObjectToStore = new Object();

        movieObjectToStore.id = movie.nfinfo.netflixid;
        movieObjectToStore.info = movie;
        
        genres.forEach(genreName => addGenreAndMovieToStore(genreName, movieObjectToStore));
    }
}

function getSingleFilmInfo(netflixId) {
    fetch(`https://unogs-unogs-v1.p.rapidapi.com/aaapi.cgi?t=loadvideo&q=${netflixId}`, {
	    "method": "GET",
        "headers": {
            "x-rapidapi-host": "unogs-unogs-v1.p.rapidapi.com",
            "x-rapidapi-key": CONFIG_UNOGS_API_KEY
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => addRecordToStoreByGenres(responseJson.RESULT.mgname, responseJson.RESULT))
    .catch(err => {
        console.log(err);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    getFilmsExpiringSoon();
});
