import { ChannelList, JoinedChannelResponse } from 'shared-interfaces/channel.interface';
import { ChatMessage } from '../../../../shared-interfaces/message.interface';
import { SET_CHANNEL_LIST } from '../../reducers/current-server.reducer';
import { NEW_CHAT_MESSAGE, CHAT_HISTORY } from '../../reducers/current-chat-channel.reducer';

export const CHAT_MESSAGE_HANDLER = 'chat-message';
export const CHANNEL_LIST_HANDLER = 'channel-list';
export const JOINED_CHANNEL_HANDLER = 'joined-channel';

export const handlers: { [key: string]: (socket, store) => void } = {
  [CHAT_MESSAGE_HANDLER]: chatMessage,
  [CHANNEL_LIST_HANDLER]: channelList,
  [JOINED_CHANNEL_HANDLER]: joinedChannel,
};

function chatMessage(socket, store) {
  socket.on(CHAT_MESSAGE_HANDLER, (message: ChatMessage) => {
    store.dispatch({
      type: NEW_CHAT_MESSAGE,
      payload: message,
    });
  });
}

function channelList(socket, store) {
  socket.on(CHANNEL_LIST_HANDLER, (channels: ChannelList) => {
    store.dispatch({
      type: SET_CHANNEL_LIST,
      payload: channels,
    });
  });
}

function joinedChannel(socket, store) {
  socket.on(JOINED_CHANNEL_HANDLER, (response: JoinedChannelResponse) => {
    store.dispatch({
      type: CHAT_HISTORY,
      payload: response,
    });
  });
}
