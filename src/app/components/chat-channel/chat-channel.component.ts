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
import { SendMessageRequest } from '../../../../shared-interfaces/message.interface';
import { SettingsService } from '../../services/settings.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import ChatServer from '../../../../shared-interfaces/server.interface';
import { ChannelSettingsService } from '../../services/channel-settings.service';

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

  @ViewChild('chatInput') private chatInput: ElementRef;

  constructor(
    private wsService: WebsocketService,
    public settingsService: SettingsService,
    private route: ActivatedRoute,
    channelSettings: ChannelSettingsService,
  ) {
    this.route.data.subscribe(data => {
      this.subscriptions.push(
        data.state.channel
          .filter(chan => !!chan)
          .subscribe((chan) => {
            this.currentChannel = chan;
            channelSettings.updateVisitedChannels();
          }),
      );
      this.subscriptions.push(
        data.state.server.subscribe(server => (this.currentServer = server)),
      );
    });
  }

  ngOnInit() { }

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

  onWindowKeydown(event: any) {
    if (
      event.target &&
      event.target.tagName !== 'INPUT' &&
      !ignoredKeys.includes(event.key)
    ) {
      this.focusChatInput();
    }
  }

  onMessagesScroll(event) {
    if (event.target.scrollTop < 130
      && !this.loadingMoreMessages
      && this.currentChannel.messages) {
      this.loadingMoreMessages = true;
      this.getMoreMessages();
    }
  }

  async getMoreMessages() {
    const channel = this.currentChannel;
    const oldestMessage = channel
      .messages[channel.messages.length - 1];

    this.wsService.socket.emit('get-chat-messages', {
      channel_id: channel._id,
      before: oldestMessage.createdAt,
    });

    setTimeout(() => { this.loadingMoreMessages = false; }, 2500);
  }
}
