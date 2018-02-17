import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { StoreModule, Store } from '@ngrx/store';
import { reducers } from '../../reducers/reducers';
import { AppState } from '../../reducers/app.states';
import { ChannelsListComponent } from './channels-list.component';
import { FormsModule } from '@angular/forms';
import { WebsocketService } from '../../services/websocket.service';
import { ErrorService } from '../../services/error.service';
import ChatServer from 'shared-interfaces/server.interface';
import { JOIN_SERVER } from '../../reducers/current-server.reducer';
import { JOIN_CHANNEL } from '../../reducers/current-chat-channel.reducer';


describe('ChannelsListComponent', () => {
  let component: ChannelsListComponent;
  let fixture: ComponentFixture<ChannelsListComponent>;
  let injector: TestBed;
  let store: Store<AppState>;

  const fakeWebSocketService = {
    socket: {
      emit: jasmine.createSpy()
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChannelsListComponent],
      imports: [
        FormsModule,
        StoreModule.forRoot(reducers),
      ],
      providers: [
        ErrorService,
        { provide: WebsocketService, useValue: fakeWebSocketService },
      ],
    })
      .compileComponents();
    injector = getTestBed();
    store = injector.get(Store);
    const currentServer: ChatServer = {
      _id: '123',
      name: 'server',
      owner_id: 'asd',
    };
    store.dispatch({
      type: JOIN_SERVER,
      payload: currentServer,
    });
    spyOn(store, 'dispatch').and.callThrough();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('creates a new channel', () => {
    component.newChannelName = 'channel-name';
    component.createChannel();
    expect(fakeWebSocketService.socket.emit)
      .toHaveBeenCalledWith('create-channel', {
        server_id: '123',
        name: 'channel-name'
      });
  });
  it('should join a channel channel', () => {
    const chan = {
      name: 'name',
      _id: '123',
      server_id: '345',
    };
    component.joinChannel(chan);
    expect(fakeWebSocketService.socket.emit)
      .toHaveBeenCalledWith('join-channel', chan._id);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: JOIN_CHANNEL,
      payload: chan,
    });
  });
});
