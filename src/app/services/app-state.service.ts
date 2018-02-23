import { Injectable } from '@angular/core';
import ChatServer from 'shared-interfaces/server.interface';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers/app.states';
import { ChatChannel } from 'shared-interfaces/channel.interface';

@Injectable()
export class AppStateService {
  public currentServer: ChatServer;
  public currentChannel: ChatChannel;
  public serverList: ChatServer[];

  constructor(private store: Store<AppState>) {
    const serverObservable = this.store.select(state => state.currentServer);
    serverObservable.subscribe(serv => {
      this.currentServer = serv;
    });
    const channelObservable = this.store.select(state => state.currentChatChannel);
    channelObservable.subscribe(chan => {
      this.currentChannel = chan;
    });
    const serverListObs = this.store.select(state => state.serverList);
    serverListObs.subscribe(list => {
      this.serverList = list;
    });
  }

}
