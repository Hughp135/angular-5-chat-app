
export async function joinChannel(io: any) {
  io.on('connection', async socket => {
    socket.on('join-channel', async channelId => {
      socket.join(channelId);
    });
  });
}
