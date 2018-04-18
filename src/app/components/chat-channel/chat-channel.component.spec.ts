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
import { ErrorService } from '../../services/error.service';
import { APPEND_CHAT_MESSAGES } from '../../reducers/current-chat-channel.reducer';

describe('ChatChannelComponent', () => {
  let component: ChatChannelComponent;
  let fixture: ComponentFixture<ChatChannelComponent>;

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

  const fakeWsService = {
    socket: {
      emit: jasmine.createSpy(),
    },
    awaitNextEvent: jasmine.createSpy().and.callFake(() => Promise.resolve([])),
  };

  const fakeStore = {
    select: () => Observable.of(channel),
    dispatch: jasmine.createSpy(),
  };

  const fakeErrorService = {
    errorMessage: {
      next: jasmine.createSpy(),
    },
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
        { provide: WebsocketService, useValue: fakeWsService },
        { provide: Store, useValue: fakeStore },
        { provide: ChannelSettingsService, useValue: { updateVisitedChannels: () => { } } },
        { provide: ErrorService, useValue: fakeErrorService },
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
    fakeWsService.awaitNextEvent.calls.reset();
    fakeWsService.socket.emit.calls.reset();
    fakeStore.dispatch.calls.reset();
    fakeErrorService.errorMessage.next.calls.reset();
  });

  it('initial state', () => {
    expect(component).toBeTruthy();
  });
  it('send message emits message', () => {
    component.sendMessage('a message');
    expect(fakeWsService.socket.emit).toHaveBeenCalledWith('send-message', {
      message: 'a message',
      channel_id: channel._id,
      server_id: server._id,
    });
  });
  it('doesnt emit if message is too short', () => {
    component.sendMessage('');
    expect(fakeWsService.socket.emit).not.toHaveBeenCalled();
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
  it('scrolling to top does not fetch if scroll > 130', async () => {
    const event = {
      target: {
        scrollTop: 200,
      },
    };
    await component.onMessagesScroll(event);
    expect(fakeWsService.awaitNextEvent).not.toHaveBeenCalled();
  });
  it('scrolling to top does not fetch if loadingMoreMessages == true', async () => {
    const event = {
      target: {
        scrollTop: 100,
      },
    };
    component.loadingMoreMessages = true;
    await component.onMessagesScroll(event);
    expect(fakeWsService.awaitNextEvent).not.toHaveBeenCalled();
  });
  it('scrolling to top does not fetch if no messages in channel', async () => {
    const event = {
      target: {
        scrollTop: 100,
      },
    };
    component.currentChannel = { ...component.currentChannel, messages: [] };
    await component.onMessagesScroll(event);
    expect(fakeWsService.awaitNextEvent).not.toHaveBeenCalled();
  });
  it('scrolling to top calls wsService if conditions are met', async () => {
    const event = {
      target: {
        scrollTop: 100,
      },
    };
    await component.onMessagesScroll(event);
    expect(fakeWsService.awaitNextEvent).toHaveBeenCalled();
  });
  it('getMoreMessages does not append msgs if empty array', async () => {
    fakeWsService.awaitNextEvent.and.callFake(async (): Promise<ChatMessage[]> => []);
    const beforeMessages = [...component.currentChannel.messages];
    await component.getMoreMessages();
    expect(fakeWsService.awaitNextEvent).toHaveBeenCalled();
    expect(fakeStore.dispatch).not.toHaveBeenCalled();
    expect(component.currentChannel.messages).toEqual(beforeMessages);
  });
  it('getMoreMessages shows error if wsService throws', async () => {
    fakeWsService.awaitNextEvent.and.callFake(async () => { throw new Error('hi'); });
    const beforeMessages = [...component.currentChannel.messages];
    await component.getMoreMessages();
    expect(fakeWsService.awaitNextEvent).toHaveBeenCalled();
    expect(fakeStore.dispatch).not.toHaveBeenCalled();
    expect(component.currentChannel.messages).toEqual(beforeMessages);
    expect(fakeErrorService.errorMessage.next).toHaveBeenCalled();
  });
  it('getMoreMessages does not append msgs messages channel id doesnt match channel id', async () => {
    fakeWsService.awaitNextEvent.and.callFake(async (): Promise<ChatMessage[]> => [
      {
        _id: '234', username: 'test', message: 'new', channel_id: '456', user_id: 'asd123',
        createdAt: new Date(), updatedAt: new Date(),
      },
    ]);
    const beforeMessages = [...component.currentChannel.messages];
    await component.getMoreMessages();
    expect(fakeWsService.awaitNextEvent).toHaveBeenCalled();
    expect(component.currentChannel.messages).toEqual(beforeMessages);
    expect(fakeStore.dispatch).not.toHaveBeenCalled();
  });
  it('getMoreMessages does not append msgsif msg with same id exists', async () => {
    fakeWsService.awaitNextEvent.and.callFake(async (): Promise<ChatMessage[]> => [
      {
        _id: '123', username: 'test', message: 'new', channel_id: '123', user_id: 'asd123',
        createdAt: new Date(), updatedAt: new Date(),
      },
    ]);
    const beforeMessages = [...component.currentChannel.messages];
    await component.getMoreMessages();
    expect(fakeWsService.awaitNextEvent).toHaveBeenCalled();
    expect(component.currentChannel.messages).toEqual(beforeMessages);
    expect(fakeStore.dispatch).not.toHaveBeenCalled();
  });
  it('getMoreMessages dispatches APPEND_CHAT_MESSAGES', async () => {
    const newMessages = [
      {
        _id: 'sdf2342', username: 'test', message: 'new', channel_id: '123', user_id: 'asd123',
        createdAt: new Date(), updatedAt: new Date(),
      },
    ];
    fakeWsService.awaitNextEvent.and
      .callFake(async (): Promise<ChatMessage[]> => newMessages);
    await component.getMoreMessages();
    expect(fakeStore.dispatch).toHaveBeenCalledTimes(1);
    expect(fakeStore.dispatch).toHaveBeenCalledWith({
      type: APPEND_CHAT_MESSAGES,
      payload: newMessages,
    });
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

function createChatMsg(username: string): ChatMessage {
  return {
    _id: '123',
    message: 'string;',
    channel_id: '123',
    user_id: 'string;',
    username,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
