const express = require('express');
const app = express();
const session = require('express-session');
const randomString = require('randomstring'); // gen random strings
const { checkState, exchangeAccessToken, profileData } = require('./middleware/index');


require('dotenv').config();

// config
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(session({
  secret: process.env.SECRET_KEY,
  cookie: {
    maxAge: 60000
  },
  resave: false,
  saveUninitialized: true,
}));

app.get('/login', (req, res) => {
  // generate random string
  const state = randomString.generate();
  // store state in session
  req.session.state = state;
  
  res.render('login', {
   // pass down errors
   error: req.session.error,
   state // pass as local variable to view
  });
  
  // Need to clear state + error
  // req.session.destroy();
});


app.get('/auth/linkedin/callback', checkState, exchangeAccessToken, profileData);

// start server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`server listning on PORT: ${PORT}`);
});
