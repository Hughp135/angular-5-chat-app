import * as express from 'express';
import apiRouter from './api/router';
import * as bodyParser from 'body-parser';
import './logger/logger';

export const app = express();

app.use(bodyParser.json());

app.use('/api', apiRouter);
