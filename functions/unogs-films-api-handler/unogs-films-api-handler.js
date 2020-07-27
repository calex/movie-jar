const fetch = require("node-fetch");

const getSingleFilmData = async (netflixId) => {  
  return fetch(`https://unogs-unogs-v1.p.rapidapi.com/aaapi.cgi?t=loadvideo&q=${netflixId}`, {
    "method": "GET",
    "headers": {
      "x-rapidapi-host": "unogs-unogs-v1.p.rapidapi.com",
      "x-rapidapi-key": process.env.CONFIG_UNOGS_API_KEY
    }
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error(response.statusText);
  })
  .then(responseJson => {
    return responseJson;
  })
  .catch(err => {
    console.log(err);
  });
}

exports.handler = async (event, context) => {
  try {
    const netflixId = event.queryStringParameters.netflixId; 
    const singleFilmData = await getSingleFilmData(netflixId)
    return {
      statusCode: 200,
      body: JSON.stringify({ singleFilmData })
    }
  } catch (err) {
    return { statusCode: 500, body: err.toString() }
  }
}

