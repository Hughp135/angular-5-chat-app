import { Component, OnInit } from '@angular/core';
import { ChatChannel } from 'shared-interfaces/channel.interface';
import { WebsocketService } from '../../services/websocket.service';
import { SendMessageRequest } from '../../../../shared-interfaces/message.interface';
import { AppStateService } from '../../services/app-state.service';

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
  ) {
  }

  ngOnInit() {
  }

  get currentChannel(): ChatChannel {
    return this.appState.currentChannel;
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
