
export async function joinChannelHandler(io: any) {
  io.on('connection', async socket => {
    socket.on('join-channel', async channelId => {

    });
  });
}
