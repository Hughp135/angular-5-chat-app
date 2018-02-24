import { Injectable } from '@angular/core';
import {
  Resolve, RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers/app.states';
import { JOIN_CHANNEL } from '../reducers/current-chat-channel.reducer';
import { WebsocketService } from './websocket.service';

@Injectable()
export class ChatChannelResolver implements Resolve<any> {

  constructor(
    private store: Store<AppState>,
    private wsService: WebsocketService
  ) { }

  async resolve(route: ActivatedRouteSnapshot, routerState: RouterStateSnapshot) {
    const id = route.paramMap.get('id');

    const channel = await this.getChannel(id);

    this.store.dispatch({
      type: JOIN_CHANNEL,
      payload: channel
    });
    this.wsService.socket.emit('join-channel', id);

    // await this.store.select('currentChatChannel')
    //   .filter(chan => !!chan.messages)
    //   .timeout(10000)
    //   .take(1)
    //   .toPromise();

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
