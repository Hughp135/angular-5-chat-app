import { app } from './api-server';
import { startWs } from './websocket/socket-server';
import * as mongoose from 'mongoose';
import * as winston from 'winston';
import './logger/logger';
import * as http from 'http';
import * as https from 'https';
import * as config from 'config';
import * as fs from 'fs';

process.on('unhandledRejection', r => console.error(r));

const API_PORT = config.get('api.port');
const MONGODB_URL = <string>config.get('mongodb.url');
const ENVIRONMENT = process.env.NODE_ENV;

winston.log('info', 'Server environment: ' + ENVIRONMENT);
winston.log('info', 'MongoDB url: ' + MONGODB_URL);

async function launch() {
  makePublicDirectory();

  await mongoose.connect(MONGODB_URL, {useNewUrlParser: true});

  createServer(<string>config.get('https.enable'));
}

launch();

async function createServer(enableHttps) {
  if (enableHttps) {
    const options = {
      cert: fs.readFileSync(<string>config.get('https.cert')),
      key: fs.readFileSync(<string>config.get('https.key')),
    };
    const httpsServer = https.createServer(options, app);
    await startWs(httpsServer);
    await httpsServer.listen(7443);
    winston.log('info', 'API Running on HTTPS port 7443');
    return;
  }

  const server = http.createServer(app);
  await startWs(server);
  await server.listen(API_PORT);
  winston.log('info', 'API Running on HTTP port ' + API_PORT);
}

function makePublicDirectory() {
  if (!fs.existsSync('back-end/dist')) {
    fs.mkdirSync('back-end/dist');
  }
  if (!fs.existsSync('back-end/dist/public')) {
    fs.mkdirSync('back-end/dist/public');
  }
  if (!fs.existsSync('back-end/dist/public/img')) {
    fs.mkdirSync('back-end/dist/public/img');
  }
  if (!fs.existsSync('back-end/dist/public/img/server-icons')) {
    fs.mkdirSync('back-end/dist/public/img/server-icons');
  }
}
