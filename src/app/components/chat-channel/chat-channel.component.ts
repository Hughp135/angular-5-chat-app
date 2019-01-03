import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { ChatChannel } from 'shared-interfaces/channel.interface';
import { WebsocketService } from '../../services/websocket.service';
import {
  SendMessageRequest,
  ChatMessage,
} from '../../../../shared-interfaces/message.interface';
import { SettingsService } from '../../services/settings.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import ChatServer from 'shared-interfaces/server.interface';
import { ChannelSettingsService } from '../../services/channel-settings.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers/app.states';
import { APPEND_CHAT_MESSAGES } from '../../reducers/current-chat-channel.reducer';
import { ErrorService, ErrorNotification } from '../../services/error.service';

const ignoredKeys = [
  'Enter',
  'Tab',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Escape',
];

@Component({
  selector: 'app-chat-channel',
  templateUrl: './chat-channel.component.html',
  styleUrls: ['./chat-channel.component.scss'],
})
export class ChatChannelComponent implements OnInit, OnDestroy, AfterViewInit {
  public chatMessage = '';
  public currentChannel: ChatChannel;
  public currentServer: ChatServer;
  private subscriptions: Subscription[] = [];
  public loadingMoreMessages = false;
  public isShiftKeyPressed = false;

  @ViewChild('chatInput') private chatInput: ElementRef;
  @ViewChild('messageContainer') private messageContainer: ElementRef;

  constructor(
    private wsService: WebsocketService,
    public settingsService: SettingsService,
    private route: ActivatedRoute,
    channelSettings: ChannelSettingsService,
    private store: Store<AppState>,
    private errorService: ErrorService,
  ) {
    this.route.data.subscribe(data => {
      this.subscriptions.push(
        data.state.channel
          .filter(chan => !!chan)
          .subscribe(chan => {
            this.currentChannel = chan;
            channelSettings.updateVisitedChannels();
          }),
      );
      this.subscriptions.push(
        data.state.server.subscribe(server => (this.currentServer = server)),
      );
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.focusChatInput();
    }, 100);
  }

  /* istanbul ignore next */
  isToday(date: Date) {
    const now = new Date();
    date = new Date(date);
    if (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    ) {
      return true;
    }
    return false;
  }

  isFollowUpMsg(i: number) {
    if (!this.currentChannel.messages[i + 1]) {
      return false;
    }
    const nextMessage = this.currentChannel.messages[i + 1];
    return nextMessage.username === this.currentChannel.messages[i].username;
  }

  hasFollowUpMsg(i: number) {
    if (!this.currentChannel.messages[i - 1]) {
      return false;
    }
    return (
      this.currentChannel.messages[i - 1].username ===
      this.currentChannel.messages[i].username
    );
  }

  sendMessage(msg: string) {
    if (msg.length < 1) {
      return;
    }
    const currentChannel = this.currentChannel;
    const currentServer = this.currentServer;
    const message: SendMessageRequest = {
      message: msg,
      channel_id: currentChannel._id,
      server_id: currentServer._id,
    };
    this.wsService.socket.emit('send-message', message);
    this.chatMessage = '';
    this.scrollChatToBottom();
  }

  getFriendChannelName(): string {
    const channelUsers = this.currentChannel.user_ids;
    const usernames = channelUsers.map((userId: string) => {
      const user = this.currentServer.channelList.users[userId];
      return user.username;
    });

    return usernames.join(', ');
  }

  focusChatInput() {
    this.chatInput.nativeElement.focus();
  }

  get chatInputRows(): number {
    const matches = this.chatMessage.match(/\n/g);
    const rowCount = matches ? matches.length + 1 : 1;

    return Math.min(5, rowCount);
  }

  onChatInputKeydown(event: any) {
    if (event.key === 'Enter' && !this.isShiftKeyPressed) {
      // Send the chat message
      this.sendMessage(this.chatMessage);
      event.preventDefault();
    }
  }

  onWindowKeydown(event: any) {
    if (
      event.target &&
      event.target.tagName !== 'TEXTAREA' &&
      !ignoredKeys.includes(event.key)
    ) {
      this.focusChatInput();
    }

    if (event.key === 'Shift') {
      this.isShiftKeyPressed = true;
    }
  }

  onWindowKeyup(event: any) {
    if (event.key === 'Shift') {
      this.isShiftKeyPressed = false;
    }
  }

  async onMessagesScroll(event) {
    if (event.target.scrollTop < 130 && !this.loadingMoreMessages) {
      this.getMoreMessages();
    }
  }

  async getMoreMessages() {
    const channel = this.currentChannel;
    if (
      !channel ||
      !channel.messages ||
      !channel.messages.length ||
      channel.messages.length >= 300
    ) {
      this.loadingMoreMessages = false;
      return;
    }

    const oldestMessage = channel.messages[channel.messages.length - 1];

    this.wsService.socket.emit('get-chat-messages', {
      channel_id: channel._id,
      before: oldestMessage.createdAt,
    });

    const messages: ChatMessage[] = <ChatMessage[]>(
      await this.wsService.awaitNextEvent('got-chat-messages', 2500).catch(err => {
        this.errorService.errorMessage.next(
          new ErrorNotification('Failed to load chat messages', 2500),
        );
      })
    );

    // Only add if there are new messages
    if (!messages || !messages.length) {
      this.loadingMoreMessages = false;
      return;
    }

    // return if message channel ID not current channel ID
    if (messages[0].channel_id !== channel._id) {
      this.loadingMoreMessages = false;
      return;
    }

    // Return if message with same ID already exists
    if (channel.messages.some(msg => msg._id === messages[0]._id)) {
      this.loadingMoreMessages = false;
      return;
    }

    this.store.dispatch({
      type: APPEND_CHAT_MESSAGES,
      payload: messages,
    });

    this.loadingMoreMessages = false;
  }

  /* istanbul ignore next */
  scrollChatToBottom() {
    this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
  }
}
