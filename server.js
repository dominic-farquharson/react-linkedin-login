const express = require('express');
const app = express();
const axios = require('axios');
require('dotenv').config();

// config
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get('/login', (req, res) => {
  res.render('login', {
   // pass down errors
  });
});

// hard coding state for now
const genState = '987654321';

// add middleware to check state
app.get('/auth/linkedin/callback', (req, res, next) => {
  const { code, state, error, error_description } = req.query;

  // first check if state matches
  if(state !== genState) {
    return res.status(401).send('not authorized');
  }

  if(error) {
    return res.json({
      error,
      error_description  
    });
  }


  next();
 
}, exchangeAccessToken );

function exchangeAccessToken(req, res, next) {
  const { code, state, error, error_description } = req.query;
  console.log('exchanging token');

  const data = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: 'http://localhost:8080/auth/linkedin/callback',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET
  };
     
   axios({
    url: 'https://www.linkedin.com/oauth/v2/accessToken',
    method: 'POST',
    headers: {
      'Content-type': 'application/x-www-urlenconded'
    },
    params:  data
  })
    .then(response => {
      const { access_token, expires_in } = response.data;
      res.status(200).json({ access_token, expires_in })
    })
    .catch(function (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        // res.send('error')
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
        // res.send('no request received')
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
        // res.send(error.message)
      }
      // console.log(error.config);
      res.redirect('/login')
    });
}

// start server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`server listning on PORT: ${PORT}`);
});
