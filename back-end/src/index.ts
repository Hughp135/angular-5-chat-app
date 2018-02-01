import { app } from './api-server';
import * as config from 'config';
import * as mongoose from 'mongoose';
import * as winston from 'winston';
import './logger/logger';

const PORT = config.get('api.port');


async function launch() {
  await mongoose.connect('mongodb://localhost/myapp');
  await app.listen(PORT);
  winston.log('info', 'API Running on port ' + PORT);
}

launch();
