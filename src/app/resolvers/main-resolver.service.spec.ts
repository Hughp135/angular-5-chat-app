import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MainResolver } from './main-resolver.service';
import { ApiService } from '../services/api.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule, Store } from '@ngrx/store';
import { reducers } from '../reducers/reducers';
import { AppState } from '../reducers/app.states';
import { ErrorService } from '../services/error.service';
import { UPDATE_SERVER_LIST } from '../reducers/server-list.reducer';
import ChatServer from '../../../shared-interfaces/server.interface';
import { Router } from '@angular/router';

describe('MainResolverService', () => {
  let apiService: ApiService;
  let httpMock: HttpTestingController;
  let store: Store<AppState>;
  let service: MainResolver;
  let router: Router;
  const fakeErrorService = {
    errorMessage: {
      next: jasmine.createSpy(),
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MainResolver,
        ApiService,
        { provide: ErrorService, useValue: fakeErrorService },
      ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        StoreModule.forRoot(reducers),
      ],
    });
    service = TestBed.get(MainResolver);
    apiService = TestBed.get(ApiService);
    httpMock = TestBed.get(HttpTestingController);
    router = TestBed.get(Router);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
    spyOn(router, 'navigate');
  });

  afterEach(() => {
    fakeErrorService.errorMessage.next.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('gets server list and updates store', fakeAsync(() => {
    const mockResponse: { servers: ChatServer[] } = {
      servers: [{ name: 'server1', _id: '123', owner_id: '345' }],
    };
    service.resolve(null, null);
    const called = httpMock.expectOne(`${apiService.BASE_URL}servers`);
    called.flush(mockResponse);
    httpMock.verify();
    tick(1);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: UPDATE_SERVER_LIST,
      payload: mockResponse.servers,
    });
  }));
  it('gets server list and updates store', fakeAsync(() => {
    const mockResponse: { servers: ChatServer[] } = {
      servers: [{ name: 'server1', _id: '123', owner_id: '345' }],
    };
    service.resolve(null, null);
    const called = httpMock.expectOne(`${apiService.BASE_URL}servers`);
    called.flush(mockResponse);
    tick(1);
  }));
  it('fails to get server list and redirects to login on 401', fakeAsync(() => {
    service.resolve(null, null);
    const called = httpMock.expectOne(`${apiService.BASE_URL}servers`);
    called.flush('Error', { status: 401, statusText: 'Unauthorized' });
    httpMock.verify();
    tick(1);
    expect(store.dispatch).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  }));
  it('fails to get server list and shows error for any other code', fakeAsync(() => {
    service.resolve(null, null);
    const called = httpMock.expectOne(`${apiService.BASE_URL}servers`);
    called.flush('Error', { status: 500, statusText: 'Unauthorized' });
    httpMock.verify();
    tick(1);
    expect(store.dispatch).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(fakeErrorService.errorMessage.next).toHaveBeenCalledWith({
      duration: 5000,
      message: 'Unable to retrieve server list.',
      id: new Date().toUTCString(),
    });
  }));
});
