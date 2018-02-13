
export async function joinChannel(io: any) {
  io.on('connection', async socket => {
    socket.on('join-channel', async channelId => {
      console.log('Joining channel', channelId);
    });
  });
}
