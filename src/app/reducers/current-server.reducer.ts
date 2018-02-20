import ChatServer, { ServerUserList, UserListUser } from 'shared-interfaces/server.interface';

export const JOIN_SERVER = 'SET_CURRENT_SERVER';
export const SET_CHANNEL_LIST = 'SET_CHANNEL_LIST';
export const SERVER_SET_USER_LIST = 'SERVER_SET_USER_LIST';
export const SERVER_UPDATE_USER_LIST = 'SERVER_UPDATE_USER_LIST';

export function currentServerReducer(state: ChatServer, action) {
  switch (action.type) {
    case JOIN_SERVER:
      return <ChatServer>action.payload;
    case SET_CHANNEL_LIST:
      if (state._id === action.payload.server_id) {
        return <ChatServer>{ ...state, channelList: action.payload };
      } else {
        console.error('Server ID of channels list doesnt match current server');
        return state;
      }
    case SERVER_SET_USER_LIST:
      if (state._id === action.payload.server_id) {
        return <ChatServer>{
          ...state,
          userList: <ServerUserList>action.payload,
        };
      } else {
        return state;
      }
    case SERVER_UPDATE_USER_LIST:
      if (state._id === action.payload.server_id) {
        const userToUpdate: UserListUser = action.payload.user;
        const newUserList = !state.userList.users
          ? [action.payload.user]
          : state.userList.users.map((usr: UserListUser) => {
            if (usr._id === userToUpdate._id) {
              return userToUpdate;
            }
            return usr;
          }).sort((a: UserListUser, b: UserListUser) => {
            return a.username > b.username ? -1
              : a.username < b.username ? 1
                : 0;
          });
        return {
          ...state,
          userList: <ServerUserList>{
            ...state.userList,
            users: newUserList,
          }
        };
      } else {
        return state;
      }
    default:
      return state;
  }
}
