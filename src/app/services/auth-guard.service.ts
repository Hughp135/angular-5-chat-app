import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { WebsocketService } from './websocket.service';

@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(private router: Router, private wsService: WebsocketService) { }

  async canActivate(route?: ActivatedRouteSnapshot, state?: RouterStateSnapshot): Promise<boolean> {
    if (this.wsService.connected) {
      return true;
    } else {
      const connected = await this.wsService.connect().toPromise();
      if (connected) {
        console.log('route', route);
        return true;
      } else {
        console.log('redirecting');
        this.router.navigate(['/login']);
        return false;
      }
    }
  }
}
