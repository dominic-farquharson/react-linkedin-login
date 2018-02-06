const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('home')
})

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`server listning on PORT: ${PORT}`)
})