import * as express from 'express';
import apiRouter from './api/router';
import * as bodyParser from 'body-parser';
import './logger/logger';
import * as cookieParser from 'cookie-parser';

export const app = express();

app.use(cookieParser());
app.use(bodyParser.json());

app.use('/api', apiRouter);
