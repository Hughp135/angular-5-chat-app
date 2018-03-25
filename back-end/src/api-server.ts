import * as express from 'express';
import apiRouter from './api/router';
import * as bodyParser from 'body-parser';
import './logger/logger';
import * as cookieParser from 'cookie-parser';
import { authMiddleware } from './api/auth/router-middleware';
import * as path from 'path';

export const app = express();

app.use(cookieParser());
app.use(bodyParser.json());

app.use('/api', apiRouter);

/* istanbul ignore next */
app.get('/img/server-icons/:img', authMiddleware, (req, res) => {
  const url = path.join(__dirname, '../dist/public/img/server-icons', req.params.img);
  res.sendFile(url);
});
