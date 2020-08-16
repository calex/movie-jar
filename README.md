# That Netlix Jar

A movie and TV series app that uses available 3rd-party API information about movies and shows on Netflix in order to provide users with an easy choice. Users can select a genre from a GUI 'jar' at random, and then get shown a Netlfix movie that is 'expiring soon' - all to lessen the 'Analysis Paralysis' that sometimes comes with trying to make a Netflix viewing choice.

Find the app hosted on Netlify at [That Netflix Jar](https://musing-bhabha-78fdac.netlify.app/).

## Screenshots

![Initial screen](/screenshots/initial-screen_2.png)
Initial screen you're greeted with.

![Genre selected screen](/screenshots/genre-selection.png)
You've been 'dealt' a genre.

![Movie selected screen](/screenshots/movie-selection.png)
You've been 'dealt' a movie or TV series within that genre.

## Built with...

- JavaScript
- jQuery
- HTML/CSS
- Netlify lambda (serverless) functions
- The uNoGS (Unofficial Netflix) API

## Running the App

The app is built and housed on Netlify in order to keep API keys hidden. If you have access to the Netlify instance, you can run the app against Netlify's lambda 'serverless' functions, which have been built to serve the API and as such use Netlify's environment variables, by doing the following:

Install Netlify cli:

`npm install netlify-cli -g`

Run Netlify dev:

`netlify dev --live`

Environment variables are set in the Netlify account and only accessible there. Out of the box, the app will run on the localhost:8888 port and the lambda functions will be available on the supplied port the CLI will give you.

## Publishing the App

Because there is no build process to automate, Netlify's typical procedure of running a build upon deployment to Git will not work. To ensure the app has been deployed and the functions are running, when you are ready to publish to Netlify, run:

`netlify deploy --prod`
