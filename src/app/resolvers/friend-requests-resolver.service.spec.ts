import { TestBed } from '@angular/core/testing';

import { FriendRequestsResolver } from './friend-requests-resolver.service';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from '../reducers/app.states';
import { reducers } from '../reducers/reducers';
import { LEAVE_CHANNEL } from '../reducers/current-chat-channel.reducer';

describe('FriendRequestsResolverService', () => {
  let service: FriendRequestsResolver;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FriendRequestsResolver],
      imports: [
        StoreModule.forRoot(reducers),
      ],
    });
    service = TestBed.get(FriendRequestsResolver);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should leave the current channel', async () => {
    await service.resolve(null, null);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: LEAVE_CHANNEL,
      payload: null,
    });
  });
});
