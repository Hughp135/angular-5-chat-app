import * as socketIo from 'socket.io';
import { logInAuth } from './auth/socket-auth';
import { log } from 'winston';

export async function startWs(server) {
  const io = socketIo(server);
  io.use(logInAuth(io));
  io.on('connection', async socket => {
    log('info', 'User connected ' + socket.id);
  });
  return io;
}

