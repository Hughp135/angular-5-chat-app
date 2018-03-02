import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { ErrorService } from './error.service';
import { Router } from '@angular/router';

@Injectable()
export class DirectMessageService {

  constructor(
    private wsService: WebsocketService,
    private errorService: ErrorService,
    private router: Router
  ) { }

  async startPm(userId: string) {
    this.wsService.socket.emit('join-or-create-dm-channel', userId);

    try {
      const id = await this.wsService
        .awaitNextEvent('got-dm-channel', 10000);

      this.router.navigate([`friends/${id}`]);
    } catch (e) {
      this.errorService.errorMessage.next({
        duration: 2500,
        message: e.message,
        id: new Date().toUTCString(),
      });
    }

  }
}
