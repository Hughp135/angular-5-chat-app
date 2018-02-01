import * as express from 'express';
import apiRouter from './api/router';
import * as bodyParser from 'body-parser';
import * as winston from 'winston';
import * as fs from 'fs';
import './logger/logger';

export const app = express();

app.use(bodyParser.json());

app.use('/api', apiRouter);
