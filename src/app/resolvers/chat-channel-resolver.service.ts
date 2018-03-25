import { Injectable } from '@angular/core';
import {
  Resolve, RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers/app.states';
import { JOIN_CHANNEL, LEAVE_CHANNEL } from '../reducers/current-chat-channel.reducer';
import { WebsocketService } from '../services/websocket.service';
import { Router } from '@angular/router';
import { ErrorService } from '../services/error.service';
import 'rxjs/add/operator/map';
import { ChatChannel, ChannelListItem } from '../../../shared-interfaces/channel.interface';

@Injectable()
export class ChatChannelResolver implements Resolve<any> {

  constructor(
    private store: Store<AppState>,
    private wsService: WebsocketService,
    private router: Router,
    private errorService: ErrorService,
  ) { }

  async resolve(route: ActivatedRouteSnapshot, routerState: RouterStateSnapshot) {
    const id = route.paramMap.get('id');
    const isOnFriendsPage = route.parent.url[0].path === 'friends';
    if (isOnFriendsPage) {
      // Refresh channel list
      this.wsService.socket.emit('get-dm-channels', undefined);
    }


    let channelListItem: ChannelListItem;
    try {
      channelListItem = await this.getChannel(id);
    } catch (e) {
      return this.channelNotFound(isOnFriendsPage, route);
    }

    const channel: ChatChannel = createChannel(channelListItem);

    this.store.dispatch({
      type: LEAVE_CHANNEL,
      payload: null,
    });

    this.store.dispatch({
      type: JOIN_CHANNEL,
      payload: channel,
    });
    this.wsService.socket.emit('join-channel', id);

    return {
      channel: this.store.select('currentChatChannel'),
      server: this.store.select('currentServer'),
    };
  }



  async getChannel(id: string): Promise<ChannelListItem> {
    const channels = await this.store.select('currentServer')
      .filter(srv => srv && !!srv.channelList)
      .map(srv => srv.channelList.channels)
      .filter(chans => chans.some(chan => chan._id === id))
      .timeout(2500)
      .take(1)
      .toPromise();

    return channels.find(chan => chan._id === id);
  }

  channelNotFound(isOnFriendsPage, route) {
    this.errorService.errorMessage.next({
      message: 'Failed to join channel.',
      duration: 2500,
      id: new Date().toUTCString(),
    });
    if (isOnFriendsPage) {
      this.router.navigate([`friends`]);
    } else {
      this.router.navigate([`../channels/${route.parent.url[1]}`]);
    }
    return false;
  }
}

function createChannel(channelListItem): ChatChannel {
  if (channelListItem.server_id) {
    // Server channel
    return {
      _id: channelListItem._id,
      name: channelListItem.name,
      server_id: channelListItem.server_id,
    };
  } else {
    // DM Channel
    return {
      _id: channelListItem._id,
      name: channelListItem.name,
      user_ids: channelListItem.user_ids,
    };
  }
}
