import ChatServer, { UserListUser } from 'shared-interfaces/server.interface';

export const SET_CURRENT_SERVER = 'SET_CURRENT_SERVER';
export const SET_CHANNEL_LIST = 'SET_CHANNEL_LIST';
export const SERVER_SET_USER_LIST = 'SERVER_SET_USER_LIST';
export const SERVER_UPDATE_USER_LIST = 'SERVER_UPDATE_USER_LIST';
export const SET_CHANNEL_LAST_MESSAGE_DATE = 'SET_CHANNEL_LAST_MESSAGE_DATE';
export const SERVER_SET_VOICE_USERS = 'SERVER_SET_VOICE_USERS';

export function currentServerReducer(state: ChatServer, action) {
  switch (action.type) {
    case SET_CURRENT_SERVER:
      return <ChatServer>action.payload;
    case SET_CHANNEL_LIST:
      if (state && state._id === action.payload.server_id) {
        const newState: ChatServer = { ...state, channelList: action.payload };
        return newState;
      } else {
        return state;
      }
    case SET_CHANNEL_LAST_MESSAGE_DATE:
      if (state && state.channelList) {
        const channel = state.channelList.channels.find(
          chan => chan._id === action.payload.id,
        );

        if (channel) {
          channel.last_message = new Date();
          const newChannels = [
            ...state.channelList.channels.filter(chan => chan._id !== channel._id),
            channel,
          ];
          const newState: ChatServer = {
            ...state,
            channelList: {
              ...state.channelList,
              channels: newChannels,
            },
          };

          return newState;
        } else {
        }
      }
      return state;
    case SERVER_SET_VOICE_USERS:
      return {
        ...state,
        voiceChannelsUsers: action.payload,
      };
    // case SET_CHANNEL_HAS_UNREAD_MESSAGES:
    //   if (state && state.channelList) {
    //     const channel = state.channelList.channels.find(chan => chan._id === action.payload.id);
    //     if (channel) {
    //       const newChannels = state.channelList.channels.map(chan => {
    //         if (chan._id === action.payload.id) {
    //           return { ...chan, has_unread_messages: action.payload.hasUnread };
    //         } else {
    //           return chan;
    //         }
    //       });
    //       const newState: ChatServer = {
    //         ...state,
    //         channelList: {
    //           ...state.channelList,
    //           channels: newChannels,
    //         },
    //       };
    //       return newState;
    //     }
    //   }
    //   return state;
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
      if (state.userList && state._id === action.payload.server_id) {
        const userToUpdate: UserListUser = action.payload.user;
        const newUserList: UserListUser[] = state.userList.map((usr: UserListUser) => {
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
