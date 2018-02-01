import * as winston from 'winston';
import * as fs from 'fs';

/* istanbul ignore next */
(function() {
  if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
  }
  winston.configure({
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: 'logs/winston.log' })
    ]
  });

})();
