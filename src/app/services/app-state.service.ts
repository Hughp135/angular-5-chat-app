import { Injectable } from '@angular/core';
import ChatServer from '../../../shared-interfaces/server.interface';

@Injectable()
export class AppStateService {
  public currentServer: ChatServer;

  constructor() { }
}
