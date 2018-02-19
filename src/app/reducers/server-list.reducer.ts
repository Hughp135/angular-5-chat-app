import Server from 'shared-interfaces/server.interface';

export const UPDATE_SERVER_LIST = 'UPDATE_SERVER_LIST';

export function serverListReducer(state: Server[] = [], action) {
  switch (action.type) {
    case UPDATE_SERVER_LIST:
      return action.payload;
    default:
      return state;
  }
}
