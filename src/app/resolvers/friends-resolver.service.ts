import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router/src/router_state';
import { ApiService } from '../services/api.service';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers/app.states';
import { Router } from '@angular/router';
import { ErrorService } from '../services/error.service';

@Injectable()
export class FriendsResolver implements Resolve<any> {

  constructor(
    private apiService: ApiService,
    private store: Store<AppState>,
    private router: Router,
    private errorService: ErrorService,
  ) { }

  async resolve(route: ActivatedRouteSnapshot, routerState: RouterStateSnapshot): Promise<any> {
    try {
      const { friends, channels }: any =
        await this.apiService
          .get('friends')
          .toPromise();
      console.log('friends', friends, 'channels', channels);
    } catch (e) {
      if (e.status === 401) {
        this.router.navigate(['/login']);
      } else {
        this.errorService.errorMessage.next({
          duration: 60000,
          message: 'Unable to retrieve server list.',
          id: new Date().toUTCString(),
        });
      }

    }
  }
}
