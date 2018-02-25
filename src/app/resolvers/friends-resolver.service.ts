import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router/src/router_state';
import { ApiService } from '../services/api.service';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers/app.states';
import { Router } from '@angular/router';
import { ErrorService } from '../services/error.service';
import { WebsocketService } from '../services/websocket.service';
import { SET_CURRENT_SERVER } from '../reducers/current-server.reducer';
import ChatServer from '../../../shared-interfaces/server.interface';
import { LEAVE_CHANNEL } from '../reducers/current-chat-channel.reducer';

@Injectable()
export class FriendsResolver implements Resolve<any> {

  constructor(
    private wsService: WebsocketService,
    private store: Store<AppState>,
    private router: Router,
    private errorService: ErrorService,
  ) { }

  async resolve(route: ActivatedRouteSnapshot, routerState: RouterStateSnapshot): Promise<any> {

    const dmServer: ChatServer = {
      _id: 'friends',
      name: 'Direct Messages',
    };

    this.store.dispatch({
      type: LEAVE_CHANNEL,
      payload: null
    });
    this.store.dispatch({
      type: SET_CURRENT_SERVER,
      payload: dmServer
    });

    this.wsService.socket.emit('get-dm-channels', undefined);

    return {
      server: this.store.select('currentServer'),
      channel: this.store.select('currentChatChannel'),
    };

  }
}
