const express = require('express');
const app = express();
const session = require('express-session');
const path = require('path');
const randomString = require('randomstring'); // gen random strings
const { checkState, exchangeAccessToken, profileData } = require('./middleware/index');


require('dotenv').config();

// config
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
// only serve static contents on the root
app.use(express.static(__dirname + '/public'));


app.use(session({
  secret: process.env.SECRET_KEY,
  cookie: {
    maxAge: 60000
  },
  resave: false,
  saveUninitialized: true,
}));

app.get('/login', (req, res) => {
  // check if user is asking for profile data
  console.log('profile ', req.query.profile)
  if(req.query.profile) {
    if(req.session.profile) {
      res.json({
        profile: req.session.profile,
      })
      req.session.destroy(); // clear session ?
      return;
    } else {
      res.json({
        profile: null
      })
      req.session.destroy(); // clear session?
      return;
    }
    // destroy session
  }
  // generate random string
  const state = randomString.generate();
  // store state in session
  req.session.state = state;

  
  // res.render('login', {
  //  // pass down errors
  //  error: req.session.error,
  //  state // pass as local variable to view
  // });

  const redirect_uri = process.env.NODE_ENV === 'development' ? `http://locahost:3000/auth/linkedin/callback` : `https://react-linkedin-login.herokuapp.com/auth/linkedin/callback`;
  res.json({
    // pass down errors
    error: req.session.error || null,
    state, // pass as local variable to view
    redirect_uri

  });
  
  // Need to clear state + error
  // req.session.destroy();
});



app.get('/auth/linkedin/callback', checkState, exchangeAccessToken, profileData);

// start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`server listning on PORT: ${PORT}`);
});
