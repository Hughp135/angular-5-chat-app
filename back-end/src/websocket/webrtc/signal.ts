
/* istanbul ignore next */
export function signal(io: any) {
  io.on('connection', async socket => {
    socket.on('signal', data => {
      handler(socket, data);
    });

  });
}

export function handler(socket, data: { socketId: string, signalData: any }) {
  socket.to(data.socketId).emit('signal', {
    socketId: socket.id,
    signalData: data.signalData,
  });
}
