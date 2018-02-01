import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';

@Injectable()
export class AuthGuardService implements CanActivate  {

  constructor(private router: Router) { }

  canActivate(route?: ActivatedRouteSnapshot, state?: RouterStateSnapshot): boolean {
    this.router.navigate(['/login']);
    return false;
  }
}
