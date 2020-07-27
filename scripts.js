'use strict';

/* Helpers ----------------------------------------------------- */

const showDomItem = ($item) => {
    $item.classList.remove('hidden');
}

const hideDomItem = ($item) => {
    $item.classList.add('hidden');
}

const getRandomItemFromArray = (array) => {
    const randomArrayItemNumber = Math.floor(Math.random() * array.length);

    return array[randomArrayItemNumber];   
}

const formatQueryParams = (params) => {
    const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

/* Globals ----------------------------------------------------- */

const STORE = [];

/* Data functions ----------------------------------------------------- */

const checkIfGenreRecordExistsThenAdd = (genreName, movieObjectToStore) => {
    const genreAlreadyInStore = STORE.some(el => el.genreName === genreName);

    if (!genreAlreadyInStore) {

        const newGenreObject = new Object();
        
        newGenreObject.id = cuid();
        newGenreObject.genreName = genreName;
        newGenreObject.moviesInGenre = [movieObjectToStore]; // init as array

        STORE.push(newGenreObject);
    
    } else {
        
        const existingGenreObject = STORE.find(el => el.genreName === genreName);

        existingGenreObject.moviesInGenre.push(movieObjectToStore);
    }
}

const addRecordToStoreByGenres = (genres, movie) => {
    if (movie.nfinfo.type === "movie") {
        const movieObjectToStore = new Object();

        movieObjectToStore.id = movie.nfinfo.netflixid;
        movieObjectToStore.info = movie;

        genres.forEach(genreName => checkIfGenreRecordExistsThenAdd(genreName, movieObjectToStore));

        removeAppLoadingState();
    }
}

const processFilmsExpiringSoon = (films) => {
    films.forEach(item => getSingleFilmInfo(item.netflixid));
}

const getFilmsExpiringSoon = () => {
    fetch("/.netlify/functions/unogs-expiring-api-handler", {
        "method": "GET",
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => processFilmsExpiringSoon(responseJson.expiringMovieData.ITEMS))
    .catch(err => {
        console.log(err);
    });
}

const getSingleFilmInfo = (netflixId) => {
    fetch(`/.netlify/functions/unogs-films-api-handler?netflixId=${netflixId}`, {
	    "method": "GET"
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => addRecordToStoreByGenres(responseJson.singleFilmData.RESULT.mgname, responseJson.singleFilmData.RESULT))
    .catch(err => {
        console.log(err);
    });
}

/* UI functions ----------------------------------------------------- */

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

        RANDOM_FILM_WITHIN_GENRE  = getRandomItemFromArray(randomStoreItem.moviesInGenre);

        $movieChoiceForm.innerHTML = `<h5>You drew</<h5><h3 class="movie-jar__genre-choice-title">&ldquo;${RANDOM_GENRE}&rdquo;<h3><button type='submit' class='button button--transparent'><h5>Get a movie in this genre!</h5></button>`;

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
                    <button id='js-start-over-button' type='submit' class='button button--bordered'><h5>Start Over</h5></button>
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

const removeAppLoadingState = () => {
    const $jarDomElTitle = document.querySelector('#js-movie-jar-title');

    $jarDomElTitle.textContent = "Click to Pick!";
}

document.addEventListener("DOMContentLoaded", () => {
    getFilmsExpiringSoon();
    watchForms();
});

