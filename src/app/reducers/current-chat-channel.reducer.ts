import { ChatChannel } from 'shared-interfaces/channel.interface';
import { ChatMessage } from 'shared-interfaces/message.interface';

export const JOIN_CHANNEL = 'JOIN_CHANNEL';
export const NEW_CHAT_MESSAGE = 'NEW_CHAT_MESSAGE';
export const CHAT_HISTORY = 'CHAT_HISTORY';
export const LEAVE_CHANNEL = 'LEAVE_CHANNEL';
export const APPEND_CHAT_MESSAGES = 'APPEND_CHAT_MESSAGES';

export function currentChatChannelReducer(state: ChatChannel, action) {
  switch (action.type) {
    case JOIN_CHANNEL:
      return <ChatChannel>action.payload;
    case LEAVE_CHANNEL:
      return undefined;
    case NEW_CHAT_MESSAGE:
      const message: ChatMessage = action.payload;
      const newMessages = state.messages ? [...state.messages] : [];
      if (newMessages.length >= 50) {
        // Remove oldest message if messages length >= 50
        newMessages.pop();
      }
      newMessages.unshift(message); // add to beginning of array
      return <ChatChannel>{
        ...state,
        messages: newMessages,
      };
    case APPEND_CHAT_MESSAGES:
      const messagesToAppend: ChatMessage[] = action.payload;
      return <ChatChannel>{
        ...state,
        messages: state.messages.concat(messagesToAppend),
      };
    case CHAT_HISTORY:
      if (state && action.payload.channel_id === state._id) {
        let messages: ChatMessage[] = action.payload.messages;
        if (state.messages) {
          messages = state.messages.concat(messages).sort((a, b) => {
            const a1 = new Date(a.createdAt);
            const b1 = new Date(b.createdAt);
            /* istanbul ignore next */
            return a1 > b1 ? -1
              : a1 < b1 ? 1
                : 0;
          });
        }
        return <ChatChannel>{
          ...state,
          messages,
        };
      } else {
        return state;
      }
    default:
      return state;
  }
}
