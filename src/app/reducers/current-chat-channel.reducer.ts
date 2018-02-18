import { ChatChannel } from 'shared-interfaces/channel.interface';

export const JOIN_CHANNEL = 'JOIN_CHANNEL';
export const NEW_CHAT_MESSAGE = 'NEW_CHAT_MESSAGE';

export function currentChatChannelReducer(state: ChatChannel, action) {
  switch (action.type) {
    case JOIN_CHANNEL:
      return action.payload;
    case NEW_CHAT_MESSAGE:
      // console.log('New chat msg', action.payload);
      const message = action.payload;
      if (message.channel_id === state._id) {
        return {
          ...state,
          messages: [message].concat(state.messages || [])
        };

      } else {
        return state;
      }

    default:
      return state;
  }
}
