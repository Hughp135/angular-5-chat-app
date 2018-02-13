import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';

import { CurrentServerComponent } from './current-server.component';
import { AppStateService } from '../../../services/app-state.service';
import { FormsModule } from '@angular/forms';
import { WebsocketService } from '../../../services/websocket.service';

describe('CurrentServerComponent', () => {
  let component: CurrentServerComponent;
  let fixture: ComponentFixture<CurrentServerComponent>;
  let injector: TestBed;
  let appState: AppStateService;

  const fakeWebSocketService = {
    socket: {
      emit: jasmine.createSpy()
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
      ],
      declarations: [CurrentServerComponent],
      providers: [
        AppStateService,
        { provide: WebsocketService, useValue: fakeWebSocketService },
      ],

    })
      .compileComponents();
    injector = getTestBed();
    appState = injector.get(AppStateService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('initial state', () => {
    expect(component).toBeTruthy();
  });
  it('creates a new channel', () => {
    appState.currentServer = {
      _id: '123',
      name: 'server',
      owner_id: 'asd',
    };
    component.newChannelName = 'channel-name';
    component.createChannel();
    expect(fakeWebSocketService.socket.emit)
      .toHaveBeenCalledWith('create-channel', {
        server_id: '123',
        name: 'channel-name'
      });
  });
});
