import { TestBed, getTestBed } from '@angular/core/testing';

import { WebsocketService } from './websocket.service';
import { SocketIO, Server } from 'mock-socket';
import { ErrorService } from './error.service';
import {
  handlers,
  CHANNEL_LIST_HANDLER,
  CHAT_MESSAGE_HANDLER,
  JOINED_CHANNEL_HANDLER,
  SERVER_USERLIST_HANDLER
} from './websocket-events/websocket-events';

import { StoreModule, Store } from '@ngrx/store';
import { reducers } from '../reducers/reducers';
import { AppState } from '../reducers/app.states';
import ChatServer from '../../../shared-interfaces/server.interface';
import { JOIN_SERVER, SET_CHANNEL_LIST, SERVER_SET_USER_LIST } from '../reducers/current-server.reducer';
import { NEW_CHAT_MESSAGE, JOIN_CHANNEL, CHAT_HISTORY } from '../reducers/current-chat-channel.reducer';
import { ChatChannel } from '../../../shared-interfaces/channel.interface';
import { ChatMessage } from '../../../shared-interfaces/message.interface';

// tslint:disable:no-unused-expression

describe('WebsocketService', () => {
  let injector: TestBed;
  let service: WebsocketService;
  let errorService: ErrorService;
  let mockServer: Server;
  (window as any).MockSocketIo = SocketIO;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WebsocketService,
        ErrorService,
      ],
      imports: [
        StoreModule.forRoot(reducers),
      ]
    });
    injector = getTestBed();
    service = injector.get(WebsocketService);
    errorService = injector.get(ErrorService);
    mockServer = new Server('http://localhost:6145');
    store = injector.get(Store);
    const currentServer: ChatServer = {
      _id: '123',
      name: 'server',
      owner_id: 'asd',
    };
    const currentChannel: ChatChannel = {
      _id: '345',
      name: 'channel',
      server_id: '123',
    };
    store.dispatch({
      type: JOIN_SERVER,
      payload: currentServer,
    });
    store.dispatch({
      type: JOIN_CHANNEL,
      payload: currentChannel,
    });
    spyOn(store, 'dispatch').and.callThrough();
  });
  afterEach(() => {
    mockServer.close();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.connected).toEqual(false);
    expect(service.socket).toBeUndefined;
  });
  it('Websocket connection fails with no token error callback', async () => {
    spyOn((window as any).MockSocketIo, 'connect').and.callFake(() => {
      return {
        on: (type, callback) => {
          if (type === 'error') {
            callback('No token provided');
          }
        }
      };
    });
    const connected = await service.connect().toPromise();
    expect(connected).toEqual(false);
    expect(service.connected).toEqual(false);
  });
  it('doesn\'t connect if already connected', async () => {
    spyOn((window as any).MockSocketIo, 'connect');
    service.connected = true;
    service.socket = { connected: true };
    const connectionResult = await service.connect().toPromise();
    expect((window as any).MockSocketIo.connect).not.toHaveBeenCalled();
    expect(connectionResult).toEqual(true);
    expect(service.socket).toBeDefined();
    expect(service.connected).toEqual(true);
  });
  it('connects to websocket', async () => {
    const connected = await service.connect().toPromise();
    expect(connected).toEqual(true);
    expect(service.socket).toBeDefined();
    expect(service.connected).toEqual(true);
  });
  it('connect and then disconnect from websocket', async (done) => {
    const connected = await service.connect().toPromise();
    expect(connected).toEqual(true);
    expect(service.socket).toBeDefined();
    expect(service.connected).toEqual(true);
    mockServer.close();
    setTimeout(() => {
      expect(service.connected).toEqual(false);
      done();
    }, 20);
  });
  it('creates errorService message on soft-error', async (done) => {
    errorService.errorMessage.subscribe((val) => {
      expect(val.message).toEqual('test message 1');
      done();
    });
    mockServer.on('connection', server => {
      mockServer.emit('soft-error', 'test message 1');
    });
    await service.connect().toPromise();
  });
  it('channel-list', () => {
    const fakeSocket = {
      on: (msg: string, callback: any) => {
        callback('success');
      }
    };
    handlers[CHANNEL_LIST_HANDLER](fakeSocket, store);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: SET_CHANNEL_LIST,
      payload: 'success',
    });
  });
  it('chat-message dispatches NEW_CHAT_MESSAGE if channel ID matches current channel', () => {
    const message: ChatMessage = {
      message: 'hi thar',
      channel_id: '345',
      user_id: '123',
      username: 'jake',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const fakeSocket = {
      on: (msg: string, callback: any) => {
        callback(message);
      }
    };
    handlers[CHAT_MESSAGE_HANDLER](fakeSocket, store);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: NEW_CHAT_MESSAGE,
      payload: message,
    });
  });
  it('chat-message does not dispatch NEW_CHAT_MESSAGE if channel ID is different', () => {
    const message: ChatMessage = {
      message: 'hi thar',
      channel_id: '712361',
      user_id: '123',
      username: 'jake',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const fakeSocket = {
      on: (msg: string, callback: any) => {
        callback(message);
      }
    };
    handlers[CHAT_MESSAGE_HANDLER](fakeSocket, store);
    expect(store.dispatch).not.toHaveBeenCalled();
  });
  it('joined-channel', () => {
    const fakeSocket = {
      on: (msg: string, callback: any) => {
        callback({ 'messages': [] });
      }
    };
    handlers[JOINED_CHANNEL_HANDLER](fakeSocket, store);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: CHAT_HISTORY,
      payload: { 'messages': [] },
    });
  });
  it('server-user-list', () => {
    const fakeSocket = {
      on: (msg: string, callback: any) => {
        callback('hi');
      }
    };
    handlers[SERVER_USERLIST_HANDLER](fakeSocket, store);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: SERVER_SET_USER_LIST,
      payload: 'hi',
    });
  });
});
