import { TestBed, getTestBed } from '@angular/core/testing';

import { WebsocketService } from './websocket.service';
import { SocketIO, Server } from 'mock-socket';
import { ErrorService } from './error.service';
import {
  handlers,
  CHANNEL_LIST_HANDLER,
  CHAT_MESSAGE_HANDLER,
  JOINED_CHANNEL_HANDLER,
  SERVER_USERLIST_HANDLER,
  SERVER_UPDATE_USERLIST_HANDLER,
  SET_FRIEND_REQUESTS_HANDLER,
} from './websocket-events/websocket-events';

import { StoreModule, Store } from '@ngrx/store';
import { reducers } from '../reducers/reducers';
import { AppState } from '../reducers/app.states';
import ChatServer from '../../../shared-interfaces/server.interface';
import { SET_CURRENT_SERVER, SET_CHANNEL_LIST, SERVER_SET_USER_LIST,
  SERVER_UPDATE_USER_LIST, SET_CHANNEL_LAST_MESSAGE_DATE } from '../reducers/current-server.reducer';
import { NEW_CHAT_MESSAGE, JOIN_CHANNEL, CHAT_HISTORY } from '../reducers/current-chat-channel.reducer';
import { ChatChannel } from '../../../shared-interfaces/channel.interface';
import { ChatMessage } from '../../../shared-interfaces/message.interface';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { SET_FRIEND_REQUESTS } from '../reducers/friends-reducer';

// tslint:disable:no-unused-expression

describe('WebsocketService', () => {
  let injector: TestBed;
  let service: WebsocketService;
  let errorService: ErrorService;
  let mockServer: Server;
  (window as any).MockSocketIo = SocketIO;
  let store: Store<AppState>;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WebsocketService,
        ErrorService,
      ],
      imports: [
        StoreModule.forRoot(reducers),
        RouterTestingModule,
      ],
    });
    injector = getTestBed();
    service = injector.get(WebsocketService);
    errorService = injector.get(ErrorService);
    mockServer = new Server('http://localhost:6145');
    router = injector.get(Router);
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
      type: SET_CURRENT_SERVER,
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
    spyOn(router, 'navigate');
    spyOn((window as any).MockSocketIo, 'connect').and.callFake(() => {
      return {
        on: (type, callback) => {
          if (type === 'error') {
            callback('No token provided');
          }
        },
      };
    });
    const connected = await service.connect().toPromise();
    expect(connected).toEqual(false);
    expect(service.connected).toEqual(false);
    expect(router.navigate).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
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
      },
    };
    handlers[CHAT_MESSAGE_HANDLER](fakeSocket, store);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: NEW_CHAT_MESSAGE,
      payload: message,
    });
  });
  it('chat-message does not dispatch NEW_CHAT_MESSAGE if channel ID is not current channel', () => {
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
      },
    };
    handlers[CHAT_MESSAGE_HANDLER](fakeSocket, store);
    expect(store.dispatch).not.toHaveBeenCalledWith({
      type: NEW_CHAT_MESSAGE,
      payload: message,
    });
  });
  it('chat-message dispatches SET_CHANNEL_LAST_MESSAGE_DATE if channel ID is not current channel', () => {
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
      },
    };
    handlers[CHAT_MESSAGE_HANDLER](fakeSocket, store);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: SET_CHANNEL_LAST_MESSAGE_DATE,
      payload: {
        id: message.channel_id,
      },
    });
  });
  it('channel-list', () => {
    const fakeSocket = {
      on: (msg: string, callback: any) => {
        callback('boo');
      },
    };
    handlers[CHANNEL_LIST_HANDLER](fakeSocket, store);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: SET_CHANNEL_LIST,
      payload: 'boo',
    });
  });
  it('joined-channel', () => {
    const fakeSocket = {
      on: (msg: string, callback: any) => {
        callback({ 'messages': [] });
      },
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
      },
    };
    handlers[SERVER_USERLIST_HANDLER](fakeSocket, store);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: SERVER_SET_USER_LIST,
      payload: 'hi',
    });
  });
  it('update-user-list', () => {
    const fakeSocket = {
      on: (msg: string, callback: any) => {
        callback('hi');
      },
    };
    handlers[SERVER_UPDATE_USERLIST_HANDLER](fakeSocket, store);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: SERVER_UPDATE_USER_LIST,
      payload: 'hi',
    });
  });
  it('friend-requests handler', () => {
    const fakeSocket = {
      on: (msg: string, callback: any) => {
        callback('hi');
      },
    };
    handlers[SET_FRIEND_REQUESTS_HANDLER](fakeSocket, store);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: SET_FRIEND_REQUESTS,
      payload: 'hi',
    });
  });
  it('awaitNextEvent', async () => {
    service.socket = {
      once: (eventName, cb) => cb('some response'),
    };
    const result = await service.awaitNextEvent('test', 1);
    expect(service.socket.removeListener).not.toHaveBeenCalled;
    expect(result).toEqual('some response');
  });
  it('awaitNextEvent timesout if response not in time', async () => {
    service.socket = {
      once: (eventName, cb) => setTimeout(() => cb('some response'), 5),
      removeListener: () => null,
    };
    try {
      await service.awaitNextEvent('test', 1);
      expect('Expected function to be rejected').toEqual('lol');
    } catch (e) {
      expect(e.message).toEqual('Request timed out');
    }
  });
});
