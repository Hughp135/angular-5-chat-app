import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';

@Injectable()
export class WebsocketService {
  public url = 'http://localhost:7202';
  public socket: SocketIOClient.Socket;
  public connected = false;

  constructor() {
  }

  public connect() {
    if (!this.socket) {
      /* istanbul ignore else  */
      if ((window as any).MockSocketIo) {
        // Necessary for testing purposes
        this.socket = (window as any).MockSocketIo.connect('http://localhost:6145');
      } else {
        this.socket = io.connect(this.url);
      }
      // this.observable = this.create();
      this.addSocketListeners();
      // return this.observable;
    } else {
      throw new Error('Socket already exists');
    }
  }

  private addSocketListeners() {
    this.socket.on('connect', (data: Object) => {
      this.connected = true;
    });
    this.socket.on('disconnect', (reason: string) => {
      // SOCKET CONNECTION LOST
      this.connected = false;
    });
  }
}
