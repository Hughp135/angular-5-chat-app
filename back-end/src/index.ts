import { app } from './api-server';
import { startWs } from './websocket/socket-server';
import * as mongoose from 'mongoose';
import * as winston from 'winston';
import './logger/logger';
import * as http from 'http';
import * as config from 'config';

process.on('unhandledRejection', r => console.error(r));

const API_PORT = config.get('api.port');

async function launch() {
  await mongoose.connect('mongodb://localhost/myapp');
  const server = http.createServer(app);
  await startWs(server);
  await server.listen(API_PORT);
  winston.log('info', 'API Running on port ' + API_PORT);
}

launch();
