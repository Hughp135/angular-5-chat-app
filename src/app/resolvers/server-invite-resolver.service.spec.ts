import { TestBed } from '@angular/core/testing';

import { ServerInviteResolver } from './server-invite-resolver.service';
import { ApiService } from '../services/api.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

describe('ServerInviteResolverService', () => {
  let service: ServerInviteResolver;
  let apiService: ApiService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ServerInviteResolver,
        ApiService,
      ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
      ],
    });
    service = TestBed.get(ServerInviteResolver);
    apiService = TestBed.get(ApiService);
    httpMock = TestBed.get(HttpTestingController);
    router = TestBed.get(Router);
    spyOn(router, 'navigate');
  });

  afterEach(() => {
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('gets channels and updates store', async () => {
    const route: any = {
      params: {
        id: '123',
      },
    };
    const promise = service.resolve(route, null);
    const called = httpMock.expectOne(`${apiService.BASE_URL}servers/invites/123`);
    called.flush({ name: 'testServer' });
    httpMock.verify();
    const result = await promise;
    expect(result).toEqual({
      server: {
        name: 'testServer',
      },
      error: undefined,
    });
  });
  it('on 404 redirect to 404 page', async () => {
    const route: any = {
      params: {
        id: '123',
      },
    };
    const promise = service.resolve(route, null);
    const called = httpMock.expectOne(`${apiService.BASE_URL}servers/invites/123`);
    called.flush('Error', { status: 404, statusText: 'NotFound' });
    httpMock.verify();
    const result = await promise;
    expect(result).toEqual({ server: undefined, error: undefined });
    expect(router.navigate).toHaveBeenCalledWith(['/error/404']);
  });
  it('non-404 error displays error msg', async () => {
    const route: any = {
      params: {
        id: '123',
      },
    };
    const promise = service.resolve(route, null);
    const called = httpMock.expectOne(`${apiService.BASE_URL}servers/invites/123`);
    called.flush('Error', { status: 500, statusText: 'NotFound' });
    httpMock.verify();
    const result = await promise;
    expect(result).toEqual({
      server: undefined,
      error: 'Unable to join this server. Please try again later.',
    });
    expect(router.navigate).not.toHaveBeenCalledWith();
  });
});
