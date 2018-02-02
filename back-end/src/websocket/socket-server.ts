import * as socketIo from 'socket.io';
import { logInAuth } from './auth/socket-auth';

export async function startWs(server) {
  const io = socketIo(server);
  io.use(logInAuth(io));
  io.on('connection', async socket => {
  });
  return io;
}

