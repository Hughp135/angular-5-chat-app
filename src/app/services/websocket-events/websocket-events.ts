import { ChannelList, JoinedChannelResponse } from 'shared-interfaces/channel.interface';
import { ChatMessage } from '../../../../shared-interfaces/message.interface';
import {
  SET_CHANNEL_LIST, SERVER_SET_USER_LIST,
  SERVER_UPDATE_USER_LIST, SET_CHANNEL_LAST_MESSAGE_DATE,
} from '../../reducers/current-server.reducer';
import { NEW_CHAT_MESSAGE, CHAT_HISTORY } from '../../reducers/current-chat-channel.reducer';
import 'rxjs/add/operator/take';
import { ServerUserList, UserListUpdate } from '../../../../shared-interfaces/server.interface';
import { User } from '../../../../shared-interfaces/user.interface';
import { SET_FRIEND_REQUESTS } from '../../reducers/friends-reducer';
import { JOIN_VOICE_CHANNEL, SET_VOICE_CHANNEL_USERS } from '../../reducers/current-voice-channel-reducer';
import { VoiceChannel } from '../../../../shared-interfaces/voice-channel.interface';
import { WebsocketService } from '../websocket.service';
import { ErrorNotification } from '../error.service';

export const CHAT_MESSAGE_HANDLER = 'chat-message';
export const CHANNEL_LIST_HANDLER = 'channel-list';
export const JOINED_CHANNEL_HANDLER = 'joined-channel';
export const SERVER_USERLIST_HANDLER = 'server-user-list';
export const SERVER_UPDATE_USERLIST_HANDLER = 'update-user-list';
export const SET_FRIEND_REQUESTS_HANDLER = 'friend-requests';
export const JOINED_VOICE_CHANNEL_HANDLER = 'joined-voice-channel';
export const VOICE_CHANNEL_USERS = 'voice-channel-users';

export const handlers: { [key: string]: (wsService: WebsocketService) => void } = {
  [CHAT_MESSAGE_HANDLER]: chatMessage,
  [CHANNEL_LIST_HANDLER]: channelList,
  [JOINED_CHANNEL_HANDLER]: joinedChannel,
  [SERVER_USERLIST_HANDLER]: serverUserList,
  [SERVER_UPDATE_USERLIST_HANDLER]: updateUserList,
  [SET_FRIEND_REQUESTS_HANDLER]: setFriendRequests,
  [JOINED_VOICE_CHANNEL_HANDLER]: joinedVoiceChannel,
  [VOICE_CHANNEL_USERS]: voiceChannelUsers,
};

function chatMessage(wsService: WebsocketService) {
  wsService.socket.on(CHAT_MESSAGE_HANDLER, (message: ChatMessage) => {
    let isCurrentServer = false;
    wsService.store.select('currentChatChannel').take(1).subscribe(channel => {
      // Only add message if it applies to current channel.
      if (channel && message.channel_id === channel._id) {
        isCurrentServer = true;
        wsService.store.dispatch({
          type: NEW_CHAT_MESSAGE,
          payload: message,
        });
      }
    });
    if (!isCurrentServer) {
      // Mark channel as having unread messages
      wsService.store.dispatch({
        type: SET_CHANNEL_LAST_MESSAGE_DATE,
        payload: {
          id: message.channel_id,
        },
      });
    }
  });
}

function channelList(wsService: WebsocketService) {
  wsService.socket.on(CHANNEL_LIST_HANDLER, async (list: ChannelList) => {
    const currentServer = await wsService.store
      .select('currentServer')
      .take(1)
      .toPromise();

    if (!currentServer || (list.server_id !== currentServer._id)) {
      return;
    }

    wsService.store.dispatch({
      type: SET_CHANNEL_LIST,
      payload: list,
    });

    const channel = await wsService.store
      .select('currentChatChannel')
      .take(1)
      .toPromise();

    if (channel && !list.channels.some(chan => chan._id === channel._id)) {
      wsService.errorService.errorMessage.next(
        new ErrorNotification('The channel you were in has been deleted.', 2500),
      );
      if (list.channels.length) {
        wsService.router.navigate([`/channels/${list.server_id}/${list.channels[0]._id}`]);
      } else {
        wsService.router.navigate([`/channels/${list.server_id}`]);
      }
    }
  });
}

function joinedChannel(wsService: WebsocketService) {
  wsService.socket.on(JOINED_CHANNEL_HANDLER, (response: JoinedChannelResponse) => {
    wsService.store.dispatch({
      type: CHAT_HISTORY,
      payload: response,
    });
  });
}

function joinedVoiceChannel(wsService: WebsocketService) {
  wsService.socket.on(JOINED_VOICE_CHANNEL_HANDLER, async (response) => {
    const { channelId, users } = response;
    const channels = await wsService.store.select('currentServer')
      .filter(srv => srv && !!srv.channelList)
      .map(srv => srv.channelList.voiceChannels)
      .filter(chans => chans.some(chan => chan._id === channelId))
      .take(1)
      .timeout(1000)
      .toPromise()
      .catch(err => { });

    if (!channels) {
      return;
    }
    const channel = channels.find(chan => chan._id === channelId);
    wsService.store.dispatch({
      type: JOIN_VOICE_CHANNEL,
      payload: { ...channel, users },
    });
  });
}

function voiceChannelUsers(wsService: WebsocketService) {
  wsService.socket.on(VOICE_CHANNEL_USERS, async (response) => {
    const { channelId, users } = response;
    const channel = await wsService.store.select('currentVoiceChannel')
      .filter((chan: VoiceChannel) => (!!chan && chan._id === channelId))
      .take(1)
      .timeout(1000)
      .toPromise()
      .catch(err => { });

    if (!channel) {
      return;
    }
    wsService.store.dispatch({
      type: SET_VOICE_CHANNEL_USERS,
      payload: users,
    });
  });
}

function serverUserList(wsService: WebsocketService) {
  wsService.socket.on(SERVER_USERLIST_HANDLER, (response: ServerUserList) => {
    wsService.store.dispatch({
      type: SERVER_SET_USER_LIST,
      payload: response,
    });
  });
}

function updateUserList(wsService: WebsocketService) {
  wsService.socket.on(SERVER_UPDATE_USERLIST_HANDLER, (response: UserListUpdate) => {
    wsService.store.dispatch({
      type: SERVER_UPDATE_USER_LIST,
      payload: response,
    });
  });
}

function setFriendRequests(wsService: WebsocketService) {
  wsService.socket.on(SET_FRIEND_REQUESTS_HANDLER, (friend_requests: User['friend_requests']) => {
    wsService.store.dispatch({
      type: SET_FRIEND_REQUESTS,
      payload: friend_requests,
    });
  });
}
