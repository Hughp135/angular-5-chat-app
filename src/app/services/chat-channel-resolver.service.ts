import { Injectable } from '@angular/core';
import {
  Resolve, RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers/app.states';
import { JOIN_CHANNEL } from '../reducers/current-chat-channel.reducer';
import { WebsocketService } from './websocket.service';
import { Router } from '@angular/router';
import { ErrorService } from './error.service';

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
    const channel = await this.getChannel(id);
    if (!channel) {
      this.errorService.errorMessage.next({
        message: 'Channel does not exist.',
        duration: 5000,
        id: new Date().toUTCString(),
      });
      this.router.navigate([`channels/${route.parent.url[0].path}`]);
      return false;
    }

    this.store.dispatch({
      type: JOIN_CHANNEL,
      payload: channel
    });
    this.wsService.socket.emit('join-channel', id);

    return {
      channel: this.store.select('currentChatChannel'),
    };
  }

  async getChannel(id: string) {
    const server = await this.store.select('currentServer')
      .filter(srv => !!srv.channelList)
      .timeout(10000)
      .take(1)
      .toPromise();
    return server.channelList.channels.find(chan => chan._id === id);
  }
}
