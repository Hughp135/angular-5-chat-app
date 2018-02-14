import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';

import { ChannelsListComponent } from './channels-list.component';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';
import { WebsocketService } from '../../services/websocket.service';
import { ErrorService } from '../../services/error.service';

describe('ChannelsListComponent', () => {
  let component: ChannelsListComponent;
  let fixture: ComponentFixture<ChannelsListComponent>;
  let injector: TestBed;
  let appState: AppStateService;

  const fakeWebSocketService = {
    socket: {
      emit: jasmine.createSpy()
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChannelsListComponent],
      imports: [FormsModule],
      providers: [
        AppStateService,
        ErrorService,
        { provide: WebsocketService, useValue: fakeWebSocketService },
      ],
    })
      .compileComponents();
    injector = getTestBed();
    appState = injector.get(AppStateService);
    appState.currentServer = {
      _id: '123',
      name: 'server',
      owner_id: 'asd',
    };
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
  });
});
