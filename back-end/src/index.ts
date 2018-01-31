import { app } from './api-server';
import * as config from 'config';
import * as mongoose from 'mongoose';

const PORT = config.get('api.port');

async function launch() {
  await mongoose.connect('mongodb://localhost/myapp');
  await app.listen(PORT);
  console.log('Running Server on port ' + PORT);
}

launch();
