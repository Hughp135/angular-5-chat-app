/* istanbul ignore next */
process.on('unhandledRejection', r => console.error(r));

/* istanbul ignore next */
export default function createFakeSocketEvent(
  eventName: string,
  data: any,
  claim: any,
  complete: any,
  result: any,
) {
  const socket = {
    handshake: { query: {} },
    claim,
    on: async (event: string, callback: any) => {
      await callback(data);
      try {
        setTimeout(async () => {
          await complete();
        }, 10);
      } catch (e) {
        console.error(e);
      }
    },
    emit: result,
    error: result,
    join: () => null,
    rooms: {
      'server-123': true
    },
    leave: async () => null,
  };

  const io = {
    on: (event: string, callback: any) => {
      callback(socket);
    },
    in: () => ({
      emit: result
    }),
    of: () => ({
      connected: {
      },
    }),
  };
  return { io, socket };
}
