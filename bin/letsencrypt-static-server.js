const express = require('express');
const app = express();

if (!fs.existsSync('static')) {
  fs.mkdirSync('static');
}

app.use(express.static('static'));
app.listen(80);

console.log('App listening on port 80');
