const express = require('express');
const app = express();

// config
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get('/login', (req, res) => {
  res.render('login');
});

// hard coding state for now
const genState = '987654321';

// add middleware to check state
app.get('/auth/linkedin/callback', (req, res) => {
  console.log(req.query);
  if(req.query.state !== genState) {
    return res.status(401).send('not authorized');
  }

  const { code, state } = req.query;

  res.json({
    code,
    state
  });
})

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`server listning on PORT: ${PORT}`);
});