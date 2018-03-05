import { app } from './api-server';
import { startWs } from './websocket/socket-server';
import * as mongoose from 'mongoose';
import * as winston from 'winston';
import './logger/logger';
import * as http from 'http';
import * as config from 'config';
import * as fs from 'fs';

process.on('unhandledRejection', r => console.error(r));

const API_PORT = config.get('api.port');

async function launch() {
  makePublicDirectory();
  await mongoose.connect('mongodb://localhost/myapp');
  const server = http.createServer(app);
  await startWs(server);
  await server.listen(API_PORT);
  winston.log('info', 'API Running on port ' + API_PORT);
}

launch();

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
