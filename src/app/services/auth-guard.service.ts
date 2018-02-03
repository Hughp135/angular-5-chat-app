import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { WebsocketService } from './websocket.service';

@Injectable()
export class AuthGuardService implements CanActivate  {

  constructor(private router: Router, private wsService: WebsocketService) { }

  canActivate(route?: ActivatedRouteSnapshot, state?: RouterStateSnapshot): boolean {
    if (!this.wsService.connected) {
      this.router.navigate(['/login']);
    }
    return this.wsService.connected;
  }
}
