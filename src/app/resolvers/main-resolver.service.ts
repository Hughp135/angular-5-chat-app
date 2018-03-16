import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers/app.states';
import { UPDATE_SERVER_LIST } from '../reducers/server-list.reducer';
import { ErrorService } from '../services/error.service';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router/src/router_state';

@Injectable()
export class MainResolver implements Resolve<any> {

  constructor(
    private apiService: ApiService,
    private store: Store<AppState>,
    private errorService: ErrorService,
    private router: Router,
  ) { }

  async resolve(route: ActivatedRouteSnapshot, routerState: RouterStateSnapshot): Promise<any> {
    try {
      const { servers }: any =
        await this.apiService
          .get('servers')
          .toPromise();
      this.store.dispatch({
        type: UPDATE_SERVER_LIST,
        payload: servers,
      });
    } catch (e) {
      if (e.status === 401) {
        this.router.navigate(['/login']);
      } else {
        this.errorService.errorMessage.next({
          duration: 5000,
          message: 'Unable to retrieve server list.',
          id: new Date().toUTCString(),
        });
      }
    }
  }
}
