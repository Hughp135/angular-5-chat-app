import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { handlers } from './websocket-events/websocket-events';
import { ErrorService, ErrorNotification } from './error.service';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers/app.states';
import { Router } from '@angular/router';

@Injectable()
export class WebsocketService {
  public url = 'http://localhost:7202';
  public socket: any;
  public connected = false;

  constructor(
    private errorService: ErrorService,
    private store: Store<AppState>,
    private router: Router,
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
      if (data === 'No token provided' || data === 'Invalid token' || data === 'User not found') {
        subj.next(false);
        subj.complete();
        this.router.navigate(['/login']);
      }
    });
    this.socket.on('soft-error', (message: string) => {
      this.errorService.errorMessage
        .next(new ErrorNotification(message, 5000));
    });
    for (const addHandler of Object.values(handlers)) {
      addHandler(this.socket, this.store);
    }
  }

  async awaitNextEvent(eventName: string, timeOut: number) {
    return await new Promise((resolve, reject) => {
      let resolved = false;
      let error = false;
      const onComplete = (data) => {
        resolved = true;
        return resolve(data);
      };
      const onError = () => {
        resolved = true;
        error = true;
      };
      this.socket.once(eventName, onComplete);
      this.socket.once('soft-error', onError);
      setTimeout(() => {
        if (!error) {
          this.socket.removeListener('soft-error', onError);
        }
        if (!resolved) {
          this.socket.removeListener(eventName, onComplete);
          reject(new Error('Request timed out'));
        }
      }, timeOut);
    });
  }
}
