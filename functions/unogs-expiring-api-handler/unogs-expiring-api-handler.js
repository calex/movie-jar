const fetch = require("node-fetch");

const getExpiringMovieData = async () => {  
  return fetch("https://unogs-unogs-v1.p.rapidapi.com/aaapi.cgi?q=get%3Aexp%3AUS&t=ns&st=adv&p=1&type=movie", {
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
    const expiringMovieData = await getExpiringMovieData()
    return {
      statusCode: 200,
      body: JSON.stringify({ expiringMovieData })
    }
  } catch (err) {
    return { statusCode: 500, body: err.toString() }
  }
}
