import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { ErrorService } from './error.service';

@Injectable()
export class FriendRequestService {

  constructor(
    private wsService: WebsocketService,
    private errorService: ErrorService,
  ) { }

  async sendFriendRequest(userId: string) {
    this.wsService.socket.emit('send-friend-request', userId);
    try {
      const result = await this.wsService
        .awaitNextEvent('sent-friend-request', 2500);
    } catch (e) {
      this.errorService.errorMessage.next({
        duration: 2500,
        message: e.message,
        id: new Date().toUTCString(),
      });
    }
  }
}
