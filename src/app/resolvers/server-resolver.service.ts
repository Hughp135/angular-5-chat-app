import { Injectable } from '@angular/core';
import {
  Resolve, RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers/app.states';
import { WebsocketService } from '../services/websocket.service';
import ChatServer from '../../../shared-interfaces/server.interface';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/filter';
import { SET_CURRENT_SERVER } from '../reducers/current-server.reducer';
import { LEAVE_CHANNEL } from '../reducers/current-chat-channel.reducer';
import { Router } from '@angular/router';
import { ErrorService } from '../services/error.service';

@Injectable()
export class ServerResolver implements Resolve<ChatServer> {

  constructor(
    private store: Store<AppState>,
    private wsService: WebsocketService,
    private router: Router,
    private errorService: ErrorService,
  ) { }

  async resolve(route: ActivatedRouteSnapshot, routerState: RouterStateSnapshot): Promise<any> {
    const id = route.paramMap.get('id');
    const currentServerStore = this.store.select('currentServer');
    try {
      await this.joinServer(id);
      if (route.children.length < 1) {
        // Wait for channel list then redirect to first channel
        const server = await currentServerStore
          .filter(srv => !!srv && !!srv.channelList)
          .take(1)
          .toPromise();
        setTimeout(() => {
          if (server.channelList.channels.length > 0) {
            this.router.navigate([`/channels/${server._id}/${server.channelList.channels[0]._id}`]);
          } else {
            this.router.navigate([`/channels/${server._id}`]);
          }
        }, 1);

      }
    } catch (e) {
      this.errorService.errorMessage.next({
        message: 'Failed to join server.',
        duration: 2500,
        id: new Date().toUTCString(),
      });
      // setTimeout(() => { // not sure why this timeout was added but removing it
      this.router.navigate(['']);
      // }, 1);
    }
    return {
      server: currentServerStore,
      channel: this.store.select('currentChatChannel'),
      voiceChannel: this.store.select('currentVoiceChannel'),
      me: this.store.select('me'),
    };
  }

  async joinServer(id: string) {
    const serverListStore = this.store.select('serverList');
    const serverList = await serverListStore
      .timeout(2500)
      .take(1)
      .toPromise();
    const server = serverList.find(srv => srv._id === id);
    if (!server) {
      throw new Error('Server not in servers list');
    }

    this.store.dispatch({
      type: LEAVE_CHANNEL,
      payload: null,
    });
    this.store.dispatch({
      type: SET_CURRENT_SERVER,
      payload: server,
    });
    this.wsService.socket.emit('join-server', id);
  }

}
