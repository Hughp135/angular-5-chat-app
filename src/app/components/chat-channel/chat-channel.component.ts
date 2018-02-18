import { Component, OnInit } from '@angular/core';
import { ChatChannel } from 'shared-interfaces/channel.interface';
import { WebsocketService } from '../../services/websocket.service';
import { SendMessageRequest } from '../../../../shared-interfaces/message.interface';
import { AppStateService } from '../../services/app-state.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-chat-channel',
  templateUrl: './chat-channel.component.html',
  styleUrls: ['./chat-channel.component.scss']
})
export class ChatChannelComponent implements OnInit {
  // public messages: Array<any>;
  public chatMessage = '';

  constructor(
    private wsService: WebsocketService,
    private appState: AppStateService,
    public settingsService: SettingsService,
  ) {
  }

  ngOnInit() {
  }

  get currentChannel(): ChatChannel {
    return this.appState.currentChannel;
  }

  /* istanbul ignore next */
  isToday(date: Date) {
    const now = new Date();
    date = new Date(date);
    if (date.getFullYear() === now.getFullYear()
      && date.getMonth() === now.getMonth()
      && date.getDate() === now.getDate()) {
      return true;
    }
    return false;
  }

  isFollowUpMsg(i: number) {
    if (!this.currentChannel.messages[i + 1]) {
      return false;
    }
    return this.currentChannel.messages[i + 1].username
      === this.currentChannel.messages[i].username;
  }

  hasFollowUpMsg(i: number) {
    if (!this.currentChannel.messages[i - 1]) {
      return false;
    }
    return this.currentChannel.messages[i - 1].username
      === this.currentChannel.messages[i].username;
  }

  sendMessage(msg: string) {
    const currentChannel = this.appState.currentChannel;
    const currentServer = this.appState.currentServer;
    const message: SendMessageRequest = {
      message: msg,
      channel_id: currentChannel._id,
      server_id: currentServer._id,
    };
    this.wsService.socket.emit('send-message', message);
    this.chatMessage = '';
  }

}
