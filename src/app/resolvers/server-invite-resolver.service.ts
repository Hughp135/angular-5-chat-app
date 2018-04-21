import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';

@Injectable()
export class ServerInviteResolver implements Resolve<any> {

  constructor(
    private apiService: ApiService,
    private router: Router,
  ) { }

  async resolve(route: ActivatedRouteSnapshot, routerState: RouterStateSnapshot): Promise<any> {
    const inviteId = route.params.id;
    let error;
    const server = await this.apiService
      .get(`servers/invites/${inviteId}`).toPromise()
      .catch(err => {
        if (err.status === 404) {
          this.router.navigate(['/error/404']);
        } else {
          error = 'We were unable to join this server for you. Please try again later.';
        }
      });

    return {
      server,
      error,
    };
  }
}
