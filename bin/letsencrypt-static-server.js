const express = require('express');
const app = express();

if (!fs.existsSync('static')) {
  fs.mkdirSync('static');
}

if (!fs.existsSync('static/.well-known')) {
  fs.mkdirSync('static/.well-known');
}

if (!fs.existsSync('static/.well-known/acme-challenge')) {
  fs.mkdirSync('static/.well-known/acme-challenge');
}

app.use(express.static('static'));
app.listen(80);

console.log('App listening on port 80');
