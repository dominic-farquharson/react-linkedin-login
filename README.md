# LinkedIn Oauth

Retrieve linkedin access token and user data w/o passport.

## Dependencies

- Express
- Express-Session
- dotenv
- randomstring


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

- The server initially renders a react frontend.

```js
// served from the public folder

app.use(express.static(__dirname + '/public'));
```

- When the App component of the React app initially mounts a request is made to the server to retrieve a state string. 

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

- The state string is a unique string, generated on the backend, that will be stored in a session. The random string is generated using the [randomstring](#) npm package.

```js
  // generate random string
  const state = randomString.generate();
  // store string in session
  req.session.state = state;

  // determine proper redirect uri based on the environemtn
  const redirect_uri = process.env.NODE_ENV === 'development' ? `http://localhost:8080/auth/linkedin/callback` : `https://react-linkedin-login.herokuapp.com/auth/linkedin/callback`;

  // send error if any, state string, and redirect uri to cient (React app)
  res.json({
    // pass down errors
    error: req.session.error || null,
    state, 
    redirect_uri

  });

```

- The state string must then be stored in the session, and passed to linkedin as a query string parameter. The client is then redirected to that url.

The client id can be stored on the frontend, the client secret must be kept on the server.


```js

fetchProfileInfo(state, redirect_uri) {
  // state and redirect uri fetched from server and inserted into string, could also pass client id
  window.location.href =`https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${your client id here}&redirect_uri=${redirect_uri}&state=${state}&scope=r_basicprofile r_emailaddress`;

  // requesting basic profile and email address permisions. These must be set from linkedin dev menu
}
```

- If the user signs in and provides permission, the user is redirected to the provided redirect_uri.

```js
// that route is handled here
app.get('/auth/linkedin/callback', checkState, exchangeAccessToken, profileData);
```

- The request is then passed through three middleware: checkState, exchangeAccessToken, profileData.

- checkState middleware

```js

```



## Usage

