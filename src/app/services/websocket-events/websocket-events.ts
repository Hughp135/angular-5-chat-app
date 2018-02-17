import { AppStateService } from '..//app-state.service';
import { ChannelList } from 'shared-interfaces/channel.interface';
import { ChatMessage } from '../../../../shared-interfaces/message.interface';

export const CHAT_MESSAGE = 'chat-message';
export const CHANNEL_LIST = 'channel-list';

export const handlers: { [key: string]: (socket, appState) => void } = {
  [CHAT_MESSAGE]: chatMessage,
  [CHANNEL_LIST]: channelList,
};

function chatMessage(socket, appState) {
  socket.on('chat-message', (message: ChatMessage) => {
    appState.addMessage(message);
  });
}

function channelList(socket, appState) {
  socket.on('channel-list', (channels: ChannelList) => {
    appState.updateChannelsList(channels);
  });
}
