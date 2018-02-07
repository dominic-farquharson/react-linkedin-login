const express = require('express');
const app = express();
const session = require('express-session');
const { checkState, exchangeAccessToken } = require('./middleware/index');


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
  res.render('login', {
   // pass down errors
   error: req.session.error
  });

  // clear session
  req.session.destroy();
});


app.get('/auth/linkedin/callback', checkState, exchangeAccessToken);

// start server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`server listning on PORT: ${PORT}`);
});
