import { ChannelList } from 'shared-interfaces/channel.interface';
import { ChatMessage } from '../../../../shared-interfaces/message.interface';
import { SET_CHANNEL_LIST } from '../../reducers/current-server.reducer';

export const CHAT_MESSAGE = 'chat-message';
export const CHANNEL_LIST = 'channel-list';

export const handlers: { [key: string]: (socket, appState) => void } = {
  // [CHAT_MESSAGE]: chatMessage,
  [CHANNEL_LIST]: channelList,
};

function chatMessage(socket, appState) {
  socket.on('chat-message', (message: ChatMessage) => {
    appState.addMessage(message);
  });
}

function channelList(socket, store) {
  socket.on('channel-list', (channels: ChannelList) => {
    store.dispatch({
      type: SET_CHANNEL_LIST,
      payload: channels,
    });
  });
}
