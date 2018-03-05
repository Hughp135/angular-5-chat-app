import Server from 'shared-interfaces/server.interface';

export const UPDATE_SERVER_LIST = 'UPDATE_SERVER_LIST';
export const ADD_SERVER_TO_LIST = 'ADD_SERVER_TO_LIST';

export function serverListReducer(
  state: Server[] = [],
  action
) {
  switch (action.type) {
    case UPDATE_SERVER_LIST:
      return action.payload;
    case ADD_SERVER_TO_LIST:
      return [
        ...state,
        action.payload
      ];
    default:
      return state;
  }
}
