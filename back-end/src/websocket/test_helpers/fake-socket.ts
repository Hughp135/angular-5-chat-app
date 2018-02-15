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
      complete();
    },
    emit: result,
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
