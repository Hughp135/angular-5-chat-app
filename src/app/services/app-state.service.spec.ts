import { TestBed, getTestBed } from '@angular/core/testing';
import { AppStateService } from './app-state.service';

import { StoreModule } from '@ngrx/store';
import { reducers } from '../reducers/reducers';

describe('AppStateService', () => {
  let injector: TestBed;
  let service: AppStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppStateService],
      imports: [
        StoreModule.forRoot(reducers),
      ],
    });
    injector = getTestBed();
    service = injector.get(AppStateService);
  });

  it('initial state', () => {
    expect(service).toBeTruthy();
    expect(service.currentServer).toBeUndefined();
  });

});
