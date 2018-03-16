import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers/app.states';
import { LEAVE_CHANNEL } from '../reducers/current-chat-channel.reducer';

@Injectable()
export class FriendRequestsResolver implements Resolve<any> {

  constructor(
    private store: Store<AppState>,
  ) { }

  async resolve(route: ActivatedRouteSnapshot, routerState: RouterStateSnapshot): Promise<any> {
    this.store.dispatch({
      type: LEAVE_CHANNEL,
      payload: null,
    });
    return;
  }
}
