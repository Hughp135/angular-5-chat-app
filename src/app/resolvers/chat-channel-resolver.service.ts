import { Injectable } from '@angular/core';
import {
  Resolve, RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers/app.states';
import { JOIN_CHANNEL, LEAVE_CHANNEL } from '../reducers/current-chat-channel.reducer';
import { WebsocketService } from '../services/websocket.service';
import { Router } from '@angular/router';
import { ErrorService } from '../services/error.service';
import 'rxjs/add/operator/map';

@Injectable()
export class ChatChannelResolver implements Resolve<any> {

  constructor(
    private store: Store<AppState>,
    private wsService: WebsocketService,
    private router: Router,
    private errorService: ErrorService
  ) { }

  async resolve(route: ActivatedRouteSnapshot, routerState: RouterStateSnapshot) {
    const id = route.paramMap.get('id');
    const isOnFriendsPage = route.parent.url[0].path === 'friends';
    if (isOnFriendsPage) {
      // Refresh channel list
      this.wsService.socket.emit('get-dm-channels', undefined);
    }

    const channel = await this.getChannel(id)
      .catch(e => {
        return this.channelNotFound(isOnFriendsPage, route);
      });

    if (!channel) {
      return;
    }

    this.store.dispatch({
      type: LEAVE_CHANNEL,
      payload: null
    });

    this.store.dispatch({
      type: JOIN_CHANNEL,
      payload: channel
    });
    this.wsService.socket.emit('join-channel', id);

    return {
      channel: this.store.select('currentChatChannel'),
      server: this.store.select('currentServer'),
    };
  }

  async getChannel(id: string) {
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
      message: 'Channel not found.',
      duration: 5000,
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
