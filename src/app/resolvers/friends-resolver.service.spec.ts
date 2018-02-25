import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';

import { FriendsResolver } from './friends-resolver.service';
import { ApiService } from '../services/api.service';
import { ErrorService } from '../services/error.service';
import { StoreModule, Store } from '@ngrx/store';
import { reducers } from '../reducers/reducers';
import { AppState } from '../reducers/app.states';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserListUser } from '../../../shared-interfaces/server.interface';
import { ChatChannel } from '../../../shared-interfaces/channel.interface';

fdescribe('FriendsResolverService', () => {
  const fakeErrorService = {
    errorMessage: {
      next: jasmine.createSpy()
    }
  };

  let apiService: ApiService;
  let httpMock: HttpTestingController;
  let store: Store<AppState>;
  let service: FriendsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FriendsResolver,
        ApiService,
        { provide: ErrorService, useValue: fakeErrorService },
      ],
      imports: [
        StoreModule.forRoot(reducers),
        RouterTestingModule,
        HttpClientTestingModule,
      ]
    });
    service = TestBed.get(FriendsResolver);
    apiService = TestBed.get(ApiService);
    httpMock = TestBed.get(HttpTestingController);
    store = TestBed.get(Store);
  });

  afterEach(() => {
    fakeErrorService.errorMessage.next.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('gets channels and updates store', fakeAsync(() => {
    const mockResponse: { channels: ChatChannel[] } = {
      channels: [{ name: 'chan1', _id: 'asd', user_ids: ['123'] }]
    };
    service.resolve(null, null);
    const called = httpMock.expectOne(`${apiService.BASE_URL}channels`);
    called.flush(mockResponse);
    httpMock.verify();
    tick(1);
    // expect(store.dispatch).toHaveBeenCalledWith({
    //   type: UPDATE_SERVER_LIST,
    //   payload: mockResponse.servers,
    // });
  }));
});
