import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { AppStateService } from './app-state.service';
import { addEventHandlers } from './websocket/websocket-events';

@Injectable()
export class WebsocketService {
  public url = 'http://localhost:7202';
  public socket: any;
  public connected = false;

  constructor(
    private appState: AppStateService,
  ) {
  }

  public connect() {
    const subj = new AsyncSubject<boolean>();
    if (this.socket && this.socket.connected) {
      subj.next(true);
      subj.complete();
      return subj;
    }
    /* istanbul ignore else  */
    if ((window as any).MockSocketIo) {
      // Necessary for testing purposes
      this.socket = (window as any).MockSocketIo.connect('http://localhost:6145');
    } else {
      this.socket = io.connect(this.url);
    }
    this.addSocketListeners(subj);
    return subj;
  }

  private addSocketListeners(subj: AsyncSubject<boolean>) {
    this.socket.on('connect', (data: Object) => {
      this.connected = true;
      subj.next(true);
      subj.complete();
    });
    this.socket.on('disconnect', (reason: string) => {
      // SOCKET CONNECTION LOST
      subj.next(false);
      subj.complete();
      this.connected = false;
    });
    this.socket.on('error', (data: Object) => {
      console.warn('Websocket Error', data);
      /* istanbul ignore next  */
      if (data === 'No token provided') {
        subj.next(false);
        subj.complete();
      }
    });
    addEventHandlers(this.socket, this.appState);
  }
}
