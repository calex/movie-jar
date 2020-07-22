'use strict';

// Helpers
const showDomItem = ($item) => {
    $item.classList.remove('hidden');
}

const hideDomItem = ($item) => {
    $item.classList.add('hidden');
}

const getRandomItemFromArray = (array) => {
    return array[Math.floor(Math.random() * array.length)];   
}

const formatQueryParams = (params) => {
    const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

// Global initializers
const STORE = [];

// Store populator functions
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

function checkIfGenreRecordExistsThenAdd(genreName, movieObjectToStore) {
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
        
        genres.forEach(genreName => checkIfGenreRecordExistsThenAdd(genreName, movieObjectToStore));
        console.log('STORE: ', STORE);
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

// UI functions
const watchForms = () => {
    const $genreForm = document.querySelector('#js-genre-choice-form');
    const $movieChoiceForm = document.querySelector('#js-movie-choice-form');
    const $movieJarSection = document.querySelector('#js-movie-jar');
    const $movieSelectionSection = document.querySelector('#js-movie-selection-showcase');
    
    let RANDOM_GENRE = "";
    let RANDOM_FILM_WITHIN_GENRE = "";

    $genreForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const randomStoreItem = getRandomItemFromArray(STORE);

        RANDOM_GENRE = randomStoreItem.genreName;

        RANDOM_FILM_WITHIN_GENRE = getRandomItemFromArray(randomStoreItem.moviesInGenre);

        $movieChoiceForm.innerHTML = `<h3>You drew <b>${RANDOM_GENRE}</b><h3><button type='submit'>Get a movie in this genre</button>`;

        hideDomItem($genreForm);
        showDomItem($movieChoiceForm);     
    });

    $movieChoiceForm.addEventListener("submit", (e) => {
        e.preventDefault();

        $movieSelectionSection.innerHTML = 
            `
                <img class='movie-showcase__poster' src=${RANDOM_FILM_WITHIN_GENRE.info.nfinfo.image1}>
                <div class='movie-showcase__summary'>
                    <h3>${RANDOM_FILM_WITHIN_GENRE.info.nfinfo.title} (${RANDOM_FILM_WITHIN_GENRE.info.nfinfo.released})</h3>
                    <h5>
                        <span>Runtime: ${RANDOM_FILM_WITHIN_GENRE.info.imdbinfo.runtime}</span>
                        &middot;
                        <span>IMDB Rating: ${RANDOM_FILM_WITHIN_GENRE.info.imdbinfo.rating} / 10</span>
                    </h5>
                    <p>${RANDOM_FILM_WITHIN_GENRE.info.nfinfo.synopsis}</p>
                    <button id='js-start-over-button' type='submit' class='start-over-button'>Start Over</button>
                </div>
            `;

        hideDomItem($movieJarSection);
        showDomItem($movieSelectionSection);

        const $startOverButton = $movieSelectionSection.querySelector('#js-start-over-button');

        $startOverButton.addEventListener("click", (e) => {
            RANDOM_GENRE = "";
            RANDOM_FILM_WITHIN_GENRE = "";
            
            $movieChoiceForm.innerHTML = '';
            $movieSelectionSection.innerHTML = '';

            hideDomItem($movieChoiceForm);
            hideDomItem($movieSelectionSection);

            showDomItem($movieJarSection);
            showDomItem($genreForm);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    getFilmsExpiringSoon();
    watchForms();
});

