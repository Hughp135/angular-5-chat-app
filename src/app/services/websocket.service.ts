import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { handlers } from './websocket-events/websocket-events';
import { ErrorService, ErrorNotification } from './error.service';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers/app.states';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AppStateService } from './app-state.service';

@Injectable()
export class WebsocketService {
  public url = environment.socket_url;
  public socket: any;
  public connected = false;
  public reconnecting = false;
  public errorMessage: ErrorNotification;

  constructor(
    public errorService: ErrorService,
    public store: Store<AppState>,
    public router: Router,
    private appState: AppStateService,
  ) {
    errorService.errorMessage.subscribe(error => {
      this.errorMessage = error;
    });
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
    this.socket.on('connect', async (data: Object) => {
      if (this.reconnecting) {
        if (this.errorMessage && this.errorMessage.id === 'lost-connection') {
          this.errorService.errorMessage.next(undefined);
        }
        this.reconnectToChannels();
      }
      this.connected = true;
      this.reconnecting = false;
      subj.next(true);
      subj.complete();
    });
    this.socket.on('disconnect', (reason: string) => {
      // SOCKET CONNECTION LOST
      this.errorService.errorMessage
        .next(new ErrorNotification(
          'Lost connection to server. Attempting to reconnect.',
          60000000,
          'lost-connection',
        ));
      subj.next(false);
      subj.complete();
      this.connected = false;
      this.reconnecting = true;
    });
    this.socket.on('error', (data: Object) => {
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
      addHandler(this);
    }
  }

  async awaitNextEvent(eventName: string, timeOut: number) {
    return await new Promise((resolve, reject) => {
      let resolved = false;
      let error = false;
      const onComplete = (data: any) => {
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

  private reconnectToChannels() {
    if (this.appState.currentServer && this.appState.currentServer._id !== 'friends') {
      this.socket.emit('join-server', this.appState.currentServer._id);
    }
    if (this.appState.currentChannel) {
      this.socket.emit('join-channel', this.appState.currentChannel._id);
    }
  }
}
