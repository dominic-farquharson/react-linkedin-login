const axios = require('axios');

// retrieve access token
const exchangeAccessToken = (req, res, next) => {
  const { code, state, error, error_description } = req.query;

  // determine redirect uri based on env
  const redirect_uri = process.env.NODE_ENV === 'development' ? `http://localhost:8080/auth/linkedin/callback` : `https://react-linkedin-login.herokuapp.com/auth/linkedin/callback`;

  const data = {
    grant_type: 'authorization_code',
    code,
    redirect_uri,
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

      res.locals.access_token = access_token;
      res.locals.expires_in = expires_in;
      next();
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
      console.log('setting errr')
      req.session.error = 'Error logging in';

      // console.log(error.config);
      res.redirect('/login')
    }); 
}

// check if state from query matches string in session
const checkState = (req, res, next) => {
  // const state = req.session.state;
  const { code, state, error, error_description } = req.query;

  // first check if state matches
  if(state !== req.session.state) {
    console.log('state ', state, req.session.state)
    return res.status(401).send('not authorized');
  }

  if(error) {
    return res.json({
      error,
      error_description  
    });
  }


  next();
}

const profileData = (req, res, next) => {
  const {access_token} = res.locals;
  const info = 'first-name,last-name,location,picture-urls::(original),email-address,picture-url'

  axios({
    url: `https://api.linkedin.com/v1/people/~:(${info})?format=json`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  })
    .then(response => {
      console.log('response ', response)

      // store profile data in session
      req.session.profile = response.data;   
      
      res.redirect('/')
      // res.json(response.data)
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
      console.log('setting errr')
      req.session.error = 'Error logging in';

      // console.log(error.config);
      // res.redirect('/login')
      next(error)
    }); 
  // res.status(200).json({ access_token, expires_in })
}

module.exports = {
  checkState,
  exchangeAccessToken,
  profileData
}