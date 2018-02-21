import { ChannelList, JoinedChannelResponse } from 'shared-interfaces/channel.interface';
import { ChatMessage } from '../../../../shared-interfaces/message.interface';
import { SET_CHANNEL_LIST, SERVER_SET_USER_LIST, SERVER_UPDATE_USER_LIST } from '../../reducers/current-server.reducer';
import { NEW_CHAT_MESSAGE, CHAT_HISTORY } from '../../reducers/current-chat-channel.reducer';
import 'rxjs/add/operator/take';
import { ServerUserList, UserListUpdate } from '../../../../shared-interfaces/server.interface';

export const CHAT_MESSAGE_HANDLER = 'chat-message';
export const CHANNEL_LIST_HANDLER = 'channel-list';
export const JOINED_CHANNEL_HANDLER = 'joined-channel';
export const SERVER_USERLIST_HANDLER = 'server-user-list';
export const SERVER_UPDATE_USERLIST_HANDLER = 'update-user-list';

export const handlers: { [key: string]: (socket, store) => void } = {
  [CHAT_MESSAGE_HANDLER]: chatMessage,
  [CHANNEL_LIST_HANDLER]: channelList,
  [JOINED_CHANNEL_HANDLER]: joinedChannel,
  [SERVER_USERLIST_HANDLER]: serverUserList,
  [SERVER_UPDATE_USERLIST_HANDLER]: updateUserList,
};

function chatMessage(socket, store) {
  socket.on(CHAT_MESSAGE_HANDLER, (message: ChatMessage) => {
    store.select(state => state.currentChatChannel).take(1).subscribe(channel => {
      // Only add message if it applies to current channel.
      if (channel && message.channel_id === channel._id) {
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
  socket.on(SERVER_USERLIST_HANDLER, (response: ServerUserList) => {
    store.dispatch({
      type: SERVER_SET_USER_LIST,
      payload: response,
    });
  });
}

function updateUserList(socket, store) {
  socket.on(SERVER_UPDATE_USERLIST_HANDLER, (response: UserListUpdate) => {
    store.dispatch({
      type: SERVER_UPDATE_USER_LIST,
      payload: response,
    });
  });
}
