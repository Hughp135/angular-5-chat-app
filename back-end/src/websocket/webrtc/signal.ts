
/* istanbul ignore next */
export function signal(io: any) {
  io.on('connection', async socket => {
    socket.on('signal', data => {
      handler(socket, data);
    });

  });
}

export function handler(socket, data: any) {
  console.log('sending signal to', data.socketId);
  socket.to(data.socketId).emit('signal', {
    socketId: socket.id,
    signalData: data.signalData,
  });
}
