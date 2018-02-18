import { TestBed, getTestBed } from '@angular/core/testing';
import { AppStateService } from './app-state.service';

import { StoreModule, Store } from '@ngrx/store';
import { reducers } from '../reducers/reducers';
import { AppState } from '../reducers/app.states';

describe('AppStateService', () => {
  let injector: TestBed;
  let service: AppStateService;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppStateService],
      imports: [
        StoreModule.forRoot(reducers),
      ],
    });
    injector = getTestBed();
    service = injector.get(AppStateService);
    store = injector.get(Store);
  });

  it('initial state', () => {
    expect(service).toBeTruthy();
    expect(service.currentServer).toBeUndefined();
  });

});
