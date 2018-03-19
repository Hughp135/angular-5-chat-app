import { handler } from '../back-end/src/websocket/message/send';
import { ObjectId } from 'bson';
import * as mongoose from 'mongoose';

const io = {
  in: () => ({
    emit: () => { },
  }),
};

const request = {
  message: 'hi there',
  channel_id: '5aaeade32c36da32849b931c',
  server_id: '5aaeade32c36da32849b9315',
};

const socket = {
  handshake: {
    query: {},
  },
  claim: {
    user_id: '5aaeade52c36da32849b9329',
  },
  emit: () => {},
};

start();

async function start( ) {
  await mongoose.connect('mongodb://localhost/myapp');
  let lastSecondCount = 0;
  setInterval(() => {
    console.error('Rate per second:', lastSecondCount);
    lastSecondCount = 0;
  }, 1000);
  while (true) {
    await handler(io, socket, request);
    ++lastSecondCount;
  }
}
