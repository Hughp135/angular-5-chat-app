import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import * as io from 'socket.io-client';

@Injectable()
export class WebsocketService {
  private url = 'http://localhost:7202';
  private observable: Observable<any>;
  private socket: SocketIOClient.Socket;

  constructor() { }

  public connect(): Observable<Object> {
    if (!this.socket) {
      this.socket = io(this.url);
      this.observable = this.create();
      return this.observable;
    } else {
      throw new Error('Socket already exists');
    }
  }

  private create(): Observable<Object> {
    // Watch the socket for changes
    const observable = new Observable(observer => {
      this.socket.on('connect', (data: Object) => {
      });
      return () => {
        // MANUAL LOGOUT OR ERROR
        this.socket.disconnect();
        this.socket = undefined;
      };
    });
    return observable;
  }
}
