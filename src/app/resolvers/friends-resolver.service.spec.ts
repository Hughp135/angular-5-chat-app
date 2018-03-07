import { TestBed } from '@angular/core/testing';

import { FriendsResolver } from './friends-resolver.service';
import { ErrorService } from '../services/error.service';
import { StoreModule, Store } from '@ngrx/store';
import { reducers } from '../reducers/reducers';
import { AppState } from '../reducers/app.states';
import { WebsocketService } from '../services/websocket.service';
import { LEAVE_CHANNEL } from '../reducers/current-chat-channel.reducer';
import { SET_CURRENT_SERVER } from '../reducers/current-server.reducer';

describe('FriendsResolverService', () => {
  const fakeErrorService = {
    errorMessage: {
      next: jasmine.createSpy()
    }
  };
  const fakeWebSocketService = {
    socket: {
      emit: jasmine.createSpy()
    }
  };

  let store: Store<AppState>;
  let service: FriendsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FriendsResolver,
        { provide: WebsocketService, useValue: fakeWebSocketService },
        { provide: ErrorService, useValue: fakeErrorService },
      ],
      imports: [
        StoreModule.forRoot(reducers),
      ]
    });
    service = TestBed.get(FriendsResolver);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
  });

  afterEach(() => {
    fakeErrorService.errorMessage.next.calls.reset();
    fakeWebSocketService.socket.emit.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('gets channels and updates store', () => {
    service.resolve(null, null);
    expect(store.dispatch).toHaveBeenCalledTimes(2);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: LEAVE_CHANNEL,
      payload: null
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: SET_CURRENT_SERVER,
      payload: {
        _id: 'friends',
        name: 'Direct Messages',
      }
    });
    expect(fakeWebSocketService.socket.emit)
      .toHaveBeenCalledWith('get-dm-channels', undefined);
  });
});
