/* istanbul ignore next */
export default function createFakeSocketEvent(
  eventName: string,
  data: any,
  claim: any,
  complete: any,
  result: any
) {
  const socket = {
    claim,
    on: async (event: string, callback: any) => {
      await callback(data);
      try {
        await complete();
      } catch (e) {
        console.error(e);
      }
    },
    emit: result,
    join: () => Promise.resolve(null),
  };

  const io = {
    on: (event: string, callback: any) => {
      callback(socket);
    },
    in: () => ({
      emit: result
    }),
  };
  return { io, socket };
}
