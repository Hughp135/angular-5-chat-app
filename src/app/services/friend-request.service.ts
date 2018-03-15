import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { ErrorService } from './error.service';

@Injectable()
export class FriendRequestService {

  constructor(
    private wsService: WebsocketService,
    private errorService: ErrorService,
  ) { }

  async removeFriend(userId: string) {
    this.wsService.socket.emit('remove-friend', userId);
  }

  async sendFriendRequest(userId: string) {
    this.wsService.socket.emit('send-friend-request', userId);
    try {
      await this.wsService
        .awaitNextEvent('sent-friend-request', 2500);
      this.wsService.socket.emit('get-friend-requests');
    } catch (e) {
      this.errorService.errorMessage.next({
        duration: 2500,
        message: e.message,
        id: new Date().toUTCString(),
      });
    }
  }

  rejectFriendRequest(userId: string) {
    this.wsService.socket.emit('reject-friend-request', userId);
  }
}
