import Server from '../services/app-state.service';

export const JOIN_SERVER = 'SET_CURRENT_SERVER';
export const SET_CHANNEL_LIST = 'SET_CHANNEL_LIST';

export function currentServerReducer(state: Server, action) {
  switch (action.type) {
    case JOIN_SERVER:
      return {
        name: action.payload.name,
        _id: action.payload._id,
      };
    case SET_CHANNEL_LIST:
      if (state._id === action.payload.server_id) {
        return { ...state, channelList: action.payload.channels };
      } else {
        console.error('Server ID of channels list doesnt match current server');
        return state;
      }
    default:
      return state;
  }
}
