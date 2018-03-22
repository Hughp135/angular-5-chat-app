import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatChannelComponent } from './chat-channel.component';
import { FormsModule } from '@angular/forms';
import { WebsocketService } from '../../services/websocket.service';
import ChatServer from 'shared-interfaces/server.interface';
import { ChatChannel } from 'shared-interfaces/channel.interface';
import { SettingsService } from '../../services/settings.service';
import { ChatMessage } from '../../../../shared-interfaces/message.interface';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { Store } from '@ngrx/store';
import { ChannelSettingsService } from '../../services/channel-settings.service';

describe('ChatChannelComponent', () => {
  let component: ChatChannelComponent;
  let fixture: ComponentFixture<ChatChannelComponent>;
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
    ],
  };
  const server: ChatServer = {
    name: 'serv',
    _id: '345',
    owner_id: 'abc',
  };

  const route = {
    data: Observable.of({
      state:
        {
          channel: Observable.of(channel),
          server: Observable.of(server),
        },
    }),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChatChannelComponent],
      imports: [
        FormsModule,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        SettingsService,
        { provide: WebsocketService, useValue: { socket: { emit } } },
        { provide: Store, useValue: { select: () => Observable.of(channel) } },
        { provide: ChannelSettingsService, useValue: { updateVisitedChannels: () => { } } },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    emit.calls.reset();
  });

  it('initial state', () => {
    expect(component).toBeTruthy();
  });
  it('send message emits message', () => {
    component.sendMessage('a message');
    expect(emit).toHaveBeenCalledWith('send-message', {
      message: 'a message',
      channel_id: channel._id,
      server_id: server._id,
    });
  });
  it('doesnt emit if message is too short', () => {
    component.sendMessage('');
    expect(emit).not.toHaveBeenCalled();
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
  it('gets correct channel name for a dm channel', () => {
    component.currentServer = <ChatServer>{
      channelList: {
        users: {
          '123': {
            username: 'user123',
          },
          '456': {
            username: 'user456',
          },
        },
      },
    };
    component.currentChannel = <ChatChannel>{
      user_ids: ['123', '456'],
    };
    const result = component.getFriendChannelName();
    expect(result).toEqual('user123, user456');
  });
  it('should focus chat input on keypress', (done) => {
    expect(document.activeElement.tagName).toEqual('BODY');
    pressKey('a');
    setTimeout(() => {
      expect(document.activeElement.tagName).toEqual('INPUT');
      done();
    }, 3);
  });
  it('should not focus chat input on ignored keycode', (done) => {
    expect(document.activeElement.tagName).toEqual('BODY');
    pressKey('Enter');
    setTimeout(() => {
      expect(document.activeElement.tagName).toEqual('BODY');
      done();
    }, 3);
  });
});

function pressKey(keycode: number | string, target?: string) {
  const event: any = document.createEvent('Event');
  event.key = keycode;
  event.initEvent('keydown');
  if (target) {
    const targetEl = document.body.getElementsByTagName('div')[0];
    targetEl.dispatchEvent(event);
  } else {
    window.dispatchEvent(event);
  }
}

function createChatMsg(username: string) {
  return <ChatMessage>{
    message: 'string;',
    channel_id: '123',
    user_id: 'string;',
    username,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
