import { TestBed, getTestBed } from '@angular/core/testing';

import { WebsocketService } from './websocket.service';
import { SocketIO, Server } from 'mock-socket';
import { ErrorService, ErrorNotification } from './error.service';
import {
  handlers,
  CHANNEL_LIST_HANDLER,
  CHAT_MESSAGE_HANDLER,
  JOINED_CHANNEL_HANDLER,
  SERVER_USERLIST_HANDLER,
  SERVER_UPDATE_USERLIST_HANDLER,
  SET_FRIEND_REQUESTS_HANDLER,
  VOICE_CHANNEL_USERS,
  JOINED_VOICE_CHANNEL_HANDLER,
} from './websocket-events/websocket-events';

import { StoreModule, Store } from '@ngrx/store';
import { reducers } from '../reducers/reducers';
import { AppState } from '../reducers/app.states';
import ChatServer from '../../../shared-interfaces/server.interface';
import {
  SET_CURRENT_SERVER, SET_CHANNEL_LIST, SERVER_SET_USER_LIST,
  SERVER_UPDATE_USER_LIST, SET_CHANNEL_LAST_MESSAGE_DATE,
} from '../reducers/current-server.reducer';
import { NEW_CHAT_MESSAGE, JOIN_CHANNEL, CHAT_HISTORY } from '../reducers/current-chat-channel.reducer';
import { ChatChannel, ChannelList } from '../../../shared-interfaces/channel.interface';
import { ChatMessage } from '../../../shared-interfaces/message.interface';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { SET_FRIEND_REQUESTS } from '../reducers/friends-reducer';
import { AppStateService } from './app-state.service';
import { SET_VOICE_CHANNEL_USERS, JOIN_VOICE_CHANNEL } from '../reducers/current-voice-channel-reducer';
import { VoiceChannel } from '../../../shared-interfaces/voice-channel.interface';
import { Observable } from 'rxjs/Observable';

describe('WebsocketService', () => {
  let injector: TestBed;
  let service: WebsocketService;
  let errorService: ErrorService;
  let mockServer: Server;
  (window as any).MockSocketIo = SocketIO;
  let store: Store<AppState>;
  let router: Router;
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
  const currentVoiceChannel: VoiceChannel = {
    _id: 'voice123',
    name: 'voicechan1',
    users: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WebsocketService,
        ErrorService,
        AppStateService,
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
    spyOn(store, 'dispatch').and.callThrough();
  });
  afterEach(() => {
    mockServer.close();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.connected).toEqual(false);
    expect(service.socket).toBeUndefined();
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
  describe('reconnecting', () => {
    it('on disconnection, set reconnecting to true', async (done) => {
      store.dispatch({
        type: SET_CURRENT_SERVER,
        payload: currentServer,
      });
      store.dispatch({
        type: JOIN_CHANNEL,
        payload: currentChannel,
      });
      await service.connect().toPromise();
      mockServer.close();
      setTimeout(async () => {
        expect(service.reconnecting).toEqual(true);
        done();
      }, 20);
    });
    it('on reconnection, should emit join server/channel if in one', async (done) => {
      store.dispatch({
        type: SET_CURRENT_SERVER,
        payload: currentServer,
      });
      store.dispatch({
        type: JOIN_CHANNEL,
        payload: currentChannel,
      });
      await service.connect().toPromise();
      mockServer.close();

      let joinedServer = null;
      let joinedChannel = null;

      setTimeout(async () => {
        mockServer = new Server('http://localhost:6145');
        mockServer.on('join-server', (id) => {
          joinedServer = id;
        });
        mockServer.on('join-channel', (id) => {
          joinedChannel = id;
        });
        await service.connect().toPromise();

        // After reconnect
        expect(service.connected).toEqual(true);
        expect(service.reconnecting).toEqual(false);
        expect(joinedServer).toEqual('123');
        expect(joinedChannel).toEqual('345');
        done();
      }, 20);
    });
    it('on reconnection, should hide the error message if shown', async (done) => {
      store.dispatch({
        type: SET_CURRENT_SERVER,
        payload: currentServer,
      });
      store.dispatch({
        type: JOIN_CHANNEL,
        payload: currentChannel,
      });

      await service.connect().toPromise();
      mockServer.close();

      setTimeout(async () => {
        // After disconnect
        expect(service.errorMessage).toBeDefined();
        expect(service.errorMessage.id).toEqual('lost-connection');
        mockServer = new Server('http://localhost:6145');

        await service.connect().toPromise();

        // After reconnect
        expect(service.errorMessage).toBeUndefined();
        done();
      }, 20);
    });
    it('on reconnection, should not hide error message if different id shown', async (done) => {
      store.dispatch({
        type: SET_CURRENT_SERVER,
        payload: currentServer,
      });
      store.dispatch({
        type: JOIN_CHANNEL,
        payload: currentChannel,
      });

      await service.connect().toPromise();
      mockServer.close();

      setTimeout(async () => {
        // After disconnect
        expect(service.errorMessage).toBeDefined();
        expect(service.errorMessage.id).toEqual('lost-connection');
        mockServer = new Server('http://localhost:6145');
        service.errorMessage = new ErrorNotification('test', 100, 'test1');

        await service.connect().toPromise();

        // After reconnect
        expect(service.errorMessage).toBeDefined();
        expect(service.errorMessage.id).toEqual('test1');
        done();
      }, 20);
    });
  });
  it('creates errorService message on soft-error', async (done) => {
    mockServer.on('connection', server => {
      mockServer.emit('soft-error', 'test message 1');
    });
    errorService.errorMessage.take(1).subscribe((val) => {
      // After connection
      expect(val.message).toEqual('test message 1');
      done();
    });
    await service.connect().toPromise();
  });
  it('chat-message dispatches NEW_CHAT_MESSAGE if channel ID matches current channel', () => {
    store.dispatch({
      type: SET_CURRENT_SERVER,
      payload: currentServer,
    });
    store.dispatch({
      type: JOIN_CHANNEL,
      payload: currentChannel,
    });
    const message: ChatMessage = {
      _id: 'asd123',
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
      _id: 'asd123',
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
      _id: 'asd123',
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
    store.dispatch({
      type: SET_CURRENT_SERVER,
      payload: currentServer,
    });
    store.dispatch({
      type: JOIN_CHANNEL,
      payload: currentChannel,
    });
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
    store.dispatch({
      type: SET_CURRENT_SERVER,
      payload: currentServer,
    });
    store.dispatch({
      type: JOIN_CHANNEL,
      payload: currentChannel,
    });
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
      removeListener: jasmine.createSpy(),
    };
    const result = await service.awaitNextEvent('test', 1);
    expect(service.socket.removeListener).not.toHaveBeenCalled();
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
  it('JOINED_VOICE_CHANNEL handler if channel not found', async () => {
    const fakeSocket = {
      on: async (msg: string, callback: any) => {
        await callback({ channelId: 'not-found_id', users: 'hi' })
          .catch(e => { if (e.message !== 'fake timeout') { throw (e); } });
      },
    };
    (store.dispatch as jasmine.Spy).calls.reset();
    spyOn(store, 'select').and.callFake(() => {
      return Observable.throw(new Error('test observable error'));
    });
    handlers[JOINED_VOICE_CHANNEL_HANDLER](fakeSocket, store);
    await new Promise(res => setTimeout(res, 5));
    expect(store.select).toHaveBeenCalled();
    expect(store.dispatch).not.toHaveBeenCalled();
  });
  it('joinedVoiceChannel dispatches JOIN_VOICE_CHANNEL when channel is found', async () => {
    store.dispatch({
      type: SET_CURRENT_SERVER,
      payload: currentServer,
    });
    const channels: ChannelList = {
      server_id: currentServer._id,
      channels: [],
      voiceChannels: [
        currentVoiceChannel,
      ],
    };
    store.dispatch({
      type: SET_CHANNEL_LIST,
      payload: channels,
    });
    const fakeSocket = {
      on: async (msg: string, callback: any) => {
        await callback({ channelId: currentVoiceChannel._id, users: 'hi' });
      },
    };
    (store.dispatch as jasmine.Spy).calls.reset();
    handlers[JOINED_VOICE_CHANNEL_HANDLER](fakeSocket, store);
    await new Promise(res => setTimeout(res, 5));
    expect(store.dispatch).toHaveBeenCalledWith({
      type: JOIN_VOICE_CHANNEL,
      payload: { ...currentVoiceChannel, users: 'hi' },
    });
  });
  it('VOICE_CHANNEL_USERS handler if channel not found', async () => {
    spyOn(store, 'select').and.callFake(() => {
      return Observable.throw(new Error('test observable error'));
    });
    const fakeSocket = {
      on: (msg: string, callback: any) => {
        callback({ channelId: 'not-found_id', users: 'hi' });
      },
    };
    handlers[VOICE_CHANNEL_USERS](fakeSocket, store);
    await new Promise(res => setTimeout(res, 5));
    expect(store.select).toHaveBeenCalled();
    expect(store.dispatch).not.toHaveBeenCalled();
  });
  it('VOICE_CHANNEL_USERS handler sets voice channel users', async () => {
    const fakeSocket = {
      on: async (msg: string, callback: any) => {
        await callback({ channelId: 'voice123', users: 'hi' });
      },
    };
    store.dispatch({
      type: JOIN_VOICE_CHANNEL,
      payload: currentVoiceChannel,
    });
    (<jasmine.Spy>store.dispatch).calls.reset();
    handlers[VOICE_CHANNEL_USERS](fakeSocket, store);
    await new Promise(res => setTimeout(res, 5));
    expect(store.dispatch).toHaveBeenCalledWith({
      type: SET_VOICE_CHANNEL_USERS,
      payload: 'hi',
    });
  });
});
