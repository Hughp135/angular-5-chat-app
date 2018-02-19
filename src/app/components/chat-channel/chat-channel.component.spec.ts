import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { ChatChannelComponent } from './chat-channel.component';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';
import { WebsocketService } from '../../services/websocket.service';
import ChatServer from 'shared-interfaces/server.interface';
import { ChatChannel } from 'shared-interfaces/channel.interface';
import { SettingsService } from '../../services/settings.service';
import { ChatMessage } from '../../../../shared-interfaces/message.interface';

describe('ChatChannelComponent', () => {
  let component: ChatChannelComponent;
  let fixture: ComponentFixture<ChatChannelComponent>;
  let injector: TestBed;
  let appState: AppStateService;
  const emit = jasmine.createSpy();

  const channel: ChatChannel = {
    name: 'name',
    _id: '123',
    server_id: '345',
    messages: [
      createChatMsg('1'),
      createChatMsg('1'),
      createChatMsg('2'),
      createChatMsg('2'),
    ]
  };
  const server: ChatServer = {
    name: 'serv',
    _id: '345',
    owner_id: 'abc',
  };

  const fakeAppState = {
    currentChannel: channel,
    currentServer: server,
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChatChannelComponent],
      imports: [
        FormsModule,
      ],
      providers: [
        SettingsService,
        { provide: AppStateService, useValue: fakeAppState },
        { provide: WebsocketService, useValue: { socket: { emit } } },
      ],
    })
      .compileComponents();
    injector = getTestBed();
    appState = injector.get(AppStateService);

  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('initial state', () => {
    expect(component).toBeTruthy();
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
  it('is follow up message', () => {
    expect(component.isFollowUpMsg(0)).toEqual(true);
    expect(component.isFollowUpMsg(1)).toEqual(false);
    expect(component.isFollowUpMsg(2)).toEqual(true);
    expect(component.isFollowUpMsg(3)).toEqual(false);
  });
  it('has follow up message', () => {
    expect(component.hasFollowUpMsg(0)).toEqual(false);
    expect(component.hasFollowUpMsg(1)).toEqual(true);
    expect(component.hasFollowUpMsg(2)).toEqual(false);
    expect(component.hasFollowUpMsg(3)).toEqual(true);
  });
});

function createChatMsg(username: string) {
  return <ChatMessage> {
    message: 'string;',
    channel_id: '123',
    user_id: 'string;',
    username,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
