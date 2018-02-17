import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';

import { ChatChannelComponent } from './chat-channel.component';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';
import { WebsocketService } from '../../services/websocket.service';

describe('ChatChannelComponent', () => {
  let component: ChatChannelComponent;
  let fixture: ComponentFixture<ChatChannelComponent>;
  let injector: TestBed;
  let appState: AppStateService;
  const emit = jasmine.createSpy();
  let channel, server;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChatChannelComponent],
      imports: [FormsModule],
      providers: [
        AppStateService,
        { provide: WebsocketService, useValue: { socket: { emit } } },
      ],
    })
      .compileComponents();
    injector = getTestBed();
    appState = injector.get(AppStateService);
    channel = {
      name: 'name',
      _id: '123',
      server_id: '345',
    };
    server = {
      name: 'serv',
      _id: '345',
      owner_id: 'abc',
    };
    appState.currentChatChannel = channel;
    appState.currentServer = server;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should get current channel', () => {
    expect(component.currentChannel).toEqual(channel);
  });
  it('send message emits message', () => {
    component.sendMessage('a message');
    expect(emit).toHaveBeenCalledWith('send-message', {
      message: 'a message',
      channel_id: channel._id,
      server_id: server._id,
    });
  });
});
