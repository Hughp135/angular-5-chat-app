import { ChannelList, JoinedChannelResponse } from 'shared-interfaces/channel.interface';
import { ChatMessage } from '../../../../shared-interfaces/message.interface';
import { SET_CHANNEL_LIST } from '../../reducers/current-server.reducer';
import { NEW_CHAT_MESSAGE, CHAT_HISTORY } from '../../reducers/current-chat-channel.reducer';
import 'rxjs/add/operator/take';

export const CHAT_MESSAGE_HANDLER = 'chat-message';
export const CHANNEL_LIST_HANDLER = 'channel-list';
export const JOINED_CHANNEL_HANDLER = 'joined-channel';
export const SERVER_USERLIST_HANDLER = 'server-user-list';

export const handlers: { [key: string]: (socket, store) => void } = {
  [CHAT_MESSAGE_HANDLER]: chatMessage,
  [CHANNEL_LIST_HANDLER]: channelList,
  [JOINED_CHANNEL_HANDLER]: joinedChannel,
  [SERVER_USERLIST_HANDLER]: serverUserList,
};

function chatMessage(socket, store) {
  socket.on(CHAT_MESSAGE_HANDLER, (message: ChatMessage) => {
    store.select(state => state.currentChatChannel).take(1).subscribe(channel => {
      if (message.channel_id === channel._id) {
        store.dispatch({
          type: NEW_CHAT_MESSAGE,
          payload: message,
        });
      }
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

function serverUserList(socket, store) {
  socket.on(SERVER_USERLIST_HANDLER, (response) => {
    console.log(response);
  });
}
