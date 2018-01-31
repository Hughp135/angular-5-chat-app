import * as jwt from 'jsonwebtoken';
import * as config from 'config';

const JWT_SECRET: string = config.get('JWT_SECRET');

export function verifyJWT(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
      if (err || !decodedToken) {
        return reject(err);
      }

      resolve(decodedToken);
    });
  });
}

export function createJWT(data, expiryTime) {
  const token = jwt.sign(data, JWT_SECRET, { expiresIn: expiryTime });
  return token;
}
