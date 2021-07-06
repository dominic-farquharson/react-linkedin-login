# LinkedIn Oauth

Retrieve linkedin access token and user data w/o passport.

## Dependencies

- Node
- Express
- Express-Session
- dotenv
- randomstring
- axios


## Installation
- Clone or download the repo.
- `cd` into the directory and run npm install.
- Create a .env file in the root of your project.
- Add relevant local variables to your .env file.
- run `npm run start` to start the node server. 
  - The built react app will be served.

Sample .env file
```
SECRET_KEY = secret_key
CLIENT_ID = linkedin_client_id
CLIENT_SECRET = linkedin_secret
NODE_ENV = 'development'
```

## Overview

The server initially renders a react frontend.

```js
// served from the public folder

app.use(express.static(__dirname + '/public'));
```

When the App component of the React app initially mounts a request is made to the server to retrieve a state string. 

```js
// Within client/src//App.js
login() {
  axios({
    url: '/login',
    method: 'GET',
  })
    .then(res => {
      if(res.error) throw 'error fetching profile info';
      // state and the redirect uri are fetched from the server
      this.fetchProfileInfo(res.data.state, res.data.redirect_uri)
    })
    .catch(err => {
      console.log('error ', err)
    })
}
```

 The state string is a unique string, generated on the backend, that will be stored in a session. The random string is generated using the [randomstring](#) npm package.

```js
  // generate random string
  const state = randomString.generate();
  // store string in session
  req.session.state = state;

  // determine proper redirect uri based on the environment
  const redirect_uri = process.env.NODE_ENV === 'development' ? `http://localhost:8080/auth/linkedin/callback` : `https://react-linkedin-login.herokuapp.com/auth/linkedin/callback`;

  // send error if any, state string, and redirect uri to cient (React app)
  res.json({
    // pass down errors
    error: req.session.error || null,
    state, 
    redirect_uri

  });

```

The state string must then be stored in the session, and passed to linkedin as a query string parameter. The client is then redirected to that url.

The client id can be stored on the frontend, the client secret must be kept on the server.


```js

fetchProfileInfo(state, redirect_uri) {
  // state and redirect uri fetched from server and inserted into string, could also pass client id
  window.location.href =`https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${your client id here}&redirect_uri=${redirect_uri}&state=${state}&scope=r_basicprofile r_emailaddress`;

  // requesting basic profile and email address permisions. These must be set from linkedin dev menu
}
```

If the user signs in and provides permission, the user is redirected to the provided redirect_uri.

```js
// that route is handled here
app.get('/auth/linkedin/callback', checkState, exchangeAccessToken, profileData);
```

The request is then passed through three middleware: checkState, exchangeAccessToken, profileData.

checkState middleware

```js
// check if state from query matches string in session
const checkState = (req, res, next) => {
  const { code, state, error, error_description } = req.query;

  // first check if state matches
  if(state !== req.session.state) {
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
```

exchangeAccessToken middleware

```js
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
      // handle errors
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

```

profileData middleware

With the access token now successfully retrieved, the user's profile data can now be fetched.

```js
const profileData = (req, res, next) => {
  const {access_token} = res.locals;

  // specifying info to include in response
  const info = 'first-name,last-name,location,picture-urls::(original),email-address,picture-url'

  axios({
    url: `https://api.linkedin.com/v1/people/~:(${info})?format=json`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  })
    .then(response => {
      // store profile data in session
      req.session.profile = response.data;   
      
      res.redirect('/')
    })
    .catch(function (error) {

      // handle errors
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

      req.session.error = 'Error logging in';
      next(error)
    }); 
}
```

## Usage

1. Fork and /or clone this repository.
1. cd into the directory.
1. Run `npm install`
1. Run `npm dev`

Note: **The built client will be served from the public directory**

To run the React app
1. cd into the client directory
1. Run `npm install`
1. Run `npm start`

