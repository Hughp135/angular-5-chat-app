import * as express from 'express';
import apiRouter from './api/router';
import * as bodyParser from 'body-parser';
import './logger/logger';
import * as cookieParser from 'cookie-parser';
import { authMiddleware } from './api/auth/router-middleware';
import * as path from 'path';
import * as compression from 'compression';

export const app = express();

// Redirect all non-secure requests to HTTPS
/* istanbul ignore next */
app.use((req, res, next) => {
  if (!req.secure && process.env.NODE_ENV === 'production') {
    const secureUrl = 'https://' + req.headers['host'] + req.url;
    res.writeHead(301, { 'Location': secureUrl });
    res.end();
  }
  next();
});

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());


// Static folder containing front-end app
const distPath = path.join(__dirname + '../../../dist');
app.use(express.static(distPath));


app.use('/api', apiRouter);


// Images
/* istanbul ignore next */
app.get('/img/server-icons/:img', authMiddleware, (req, res) => {
  const url = path.join(__dirname, '../dist/public/img/server-icons', req.params.img);
  res.sendFile(url);
});

// Resolve all app routes back to index.html
/* istanbul ignore next */
app.get(['/friends', '/friends/*', '/channels', '/channels/*', '/login'], function (req, res) {
  res.sendFile(path.join(__dirname + '../../../dist/index.html'));
});
