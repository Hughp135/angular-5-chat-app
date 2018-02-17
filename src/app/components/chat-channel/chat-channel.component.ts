import { Component, OnInit } from '@angular/core';
import { AppStateService } from '../../services/app-state.service';
import { Channel } from 'shared-interfaces/channel.interface';
import { WebsocketService } from '../../services/websocket.service';
import { SendMessageRequest } from '../../../../shared-interfaces/message.interface';

@Component({
  selector: 'app-chat-channel',
  templateUrl: './chat-channel.component.html',
  styleUrls: ['./chat-channel.component.scss']
})
export class ChatChannelComponent implements OnInit {
  // public messages: Array<any>;
  public chatMessage = '';

  constructor(public appState: AppStateService, private wsService: WebsocketService) {
  }

  ngOnInit() {
  }

  get currentChannel(): Channel {
    return this.appState.currentChatChannel;
  }

  sendMessage(msg: string) {
    const message: SendMessageRequest = {
      message: msg,
      channel_id: this.appState.currentChatChannel._id,
      server_id: this.appState.currentServer._id,
    };
    this.wsService.socket.emit('send-message', message);
    this.chatMessage = '';
  }

}
