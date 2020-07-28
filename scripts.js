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

/* Globals ----------------------------------------------------- */

const STORE = [];

/* Data and API Handling functions ----------------------------------------------------- */

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

        if (STORE.length > 10) {
            addGenreDomItemRepresentation(STORE.length);
        }

        removeAppLoadingState();
    }
}

const processFilmsExpiringSoon = (films) => {
    films.forEach(item => {
        getSingleFilmInfo(item.netflixid);
    });
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

/* UI Handling functions ----------------------------------------------------- */

const animateIntoJar = (domItem, itemNumber) => {
    let pos = 120;
    let id = setInterval(frame, 5);
    
    function frame() {
        if (pos == 10) {
            clearInterval(id);
        } else {
            pos--; 
            domItem.style.bottom = (pos + (itemNumber / 10)) + "%"; 
        }
    }
}


const addGenreDomItemRepresentation = (itemNumber) => {
    const $movieJarPaperList = document.querySelector('#js-movie-jar-paper-list');

    const listItemNode = document.createElement("LI");   

    $(listItemNode).addClass('js-dynamically-added');

    let randomNumberBetween1and90 = Math.floor(Math.random() * 90) + 1;

    let randomNumberBetween1and100 = Math.floor(Math.random() * 100) + 1;

    listItemNode.setAttribute('style', `transform: rotate(${randomNumberBetween1and90}deg); left:${randomNumberBetween1and100}%;`);

    animateIntoJar(listItemNode, itemNumber);

    $movieJarPaperList.appendChild(listItemNode);
}

const removeAppLoadingState = () => {
    const jarDomElLoadingTitleId = '#js-movie-jar-loading-title';

    $('#js-movie-jar').addClass('js-ready');

    $(jarDomElLoadingTitleId).addClass('js-animate-out');

    const timedClassSwitches = setTimeout(() => { 
        $(jarDomElLoadingTitleId).addClass('hidden');
        $('#js-movie-jar-ready-title').removeClass('hidden').addClass('js-animate-in');
    }, 1000);
}

/* Form Submission & Button Handling functions ----------------------------------------------------- */

const watchForms = () => {
    const $genreForm = document.querySelector('#js-genre-choice-form');
    const $movieChoiceFormWrapper = document.querySelector('#js-movie-choice-form-wrapper');

    const $movieJarSection = document.querySelector('#js-movie-jar');
    const $movieSelectionSection = document.querySelector('#js-movie-selection-showcase');
    
    let RANDOM_GENRE = "";
    let RANDOM_FILM_WITHIN_GENRE = "";

    $('#js-genre-choice-form').on('submit', function(e) {
        e.preventDefault();

        const randomStoreItem = getRandomItemFromArray(STORE);

        RANDOM_GENRE = randomStoreItem.genreName;

        RANDOM_FILM_WITHIN_GENRE  = getRandomItemFromArray(randomStoreItem.moviesInGenre);

        $movieChoiceFormWrapper.innerHTML = `
            <form id='js-movie-choice-form'>
                <h5>You drew</h5>
                <div class='movie-jar__genre-choice-title-block'>
                    <h3 class="movie-jar__genre-choice-title">&ldquo;${RANDOM_GENRE}&rdquo;</h3>
                </div>
                <button type='submit' class='button button--bordered'>Get a movie in this genre!</button>
                <h5 class="button-interstitial-text">&ndash; or &ndash;</h5>
            </form>
            <button class='button button--bordered js-start-over-button'>
                Dither more and start over!
            </button>
        `;
        
        hideDomItem($genreForm);
        showDomItem($movieChoiceFormWrapper);            
    });

    $('#js-movie-jar-area').on('submit', '#js-movie-choice-form', function(e) {
        e.preventDefault();

        $movieSelectionSection.innerHTML = 
            `
                <div class='movie-showcase__poster'>
                    <img alt=${RANDOM_FILM_WITHIN_GENRE.info.nfinfo.title} src=${RANDOM_FILM_WITHIN_GENRE.info.nfinfo.image1} />
                </div>
                <div class='movie-showcase__summary'>
                    <h3 class="movie-showcase__title">${RANDOM_FILM_WITHIN_GENRE.info.nfinfo.title} (${RANDOM_FILM_WITHIN_GENRE.info.nfinfo.released})</h3>
                    <h5 class="movie-showcase__subtitle">
                       Runtime: ${RANDOM_FILM_WITHIN_GENRE.info.imdbinfo.runtime}
                    </h5>
                    <h5 class="movie-showcase__subtitle">
                        IMDB Rating: ${RANDOM_FILM_WITHIN_GENRE.info.imdbinfo.rating} / 10
                    </h5>
                    <p class="movie-showcase__synopsis">${RANDOM_FILM_WITHIN_GENRE.info.nfinfo.synopsis}</p>
                    <button type='submit' class='button button--bordered js-start-over-button'>Start Over</button>
                </div>
            `;

        hideDomItem($movieChoiceFormWrapper);

        $('#js-movie-jar').addClass('js-reveal-state');
        
        showDomItem($movieSelectionSection);

        $('#js-movie-selection-showcase').addClass('js-animate-in');

    });

    $('#js-movie-jar-area').on('click', '.js-start-over-button', function(e) {
        e.preventDefault();
    
        RANDOM_GENRE = "";
        RANDOM_FILM_WITHIN_GENRE = "";
        
        $movieChoiceFormWrapper.innerHTML = '';
        $movieSelectionSection.innerHTML = '';
    
        hideDomItem($movieChoiceFormWrapper);
        hideDomItem($movieSelectionSection);
    
        showDomItem($movieJarSection);
        showDomItem($genreForm);

        $('#js-movie-jar').removeClass('js-reveal-state');
    });
}

document.addEventListener("DOMContentLoaded", () => {
    getFilmsExpiringSoon();
    watchForms();
});

