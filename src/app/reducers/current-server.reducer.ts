import ChatServer, { UserListUser } from 'shared-interfaces/server.interface';

export const SET_CURRENT_SERVER = 'SET_CURRENT_SERVER';
export const SET_CHANNEL_LIST = 'SET_CHANNEL_LIST';
export const SERVER_SET_USER_LIST = 'SERVER_SET_USER_LIST';
export const SERVER_UPDATE_USER_LIST = 'SERVER_UPDATE_USER_LIST';

export function currentServerReducer(state: ChatServer, action) {
  switch (action.type) {
    case SET_CURRENT_SERVER:
      return <ChatServer>action.payload;
    case SET_CHANNEL_LIST:
      if (state && state._id === action.payload.server_id) {
        return <ChatServer>{ ...state, channelList: action.payload };
      } else {
        return state;
      }
    case SERVER_SET_USER_LIST:
      if (state._id === action.payload.server_id) {
        return <ChatServer>{
          ...state,
          userList: <UserListUser[]>action.payload.users,
        };
      } else {
        return state;
      }
    case SERVER_UPDATE_USER_LIST:
      // console.log('updating user', action.payload.user);
      if (state.userList && state._id === action.payload.server_id) {
        const userToUpdate: UserListUser = action.payload.user;
        const newUserList: UserListUser[] = state.userList
          .map((usr: UserListUser) => {
            if (usr._id === userToUpdate._id) {
              return userToUpdate; // replace relevant user in list
            }
            return usr;
          });
        return {
          ...state,
          userList: <UserListUser[]>newUserList,
        };
      } else {
        return state;
      }
    default:
      return state;
  }
}
