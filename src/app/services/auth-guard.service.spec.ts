import { TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

import { AuthGuardService } from './auth-guard.service';
import { WebsocketService } from './websocket.service';
import { AppStateService } from './app-state.service';

describe('AuthGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthGuardService,
        WebsocketService,
        AppStateService,
      ],
    });
  });

  it('should be created', inject([AuthGuardService], (service: AuthGuardService) => {
    expect(service).toBeTruthy();
  }));
  it('should attempt to connect and redirect to /login',
    inject(
      [AuthGuardService, Router, WebsocketService],
      async (service: AuthGuardService, router: Router, wsService: WebsocketService) => {
        spyOn(router, 'navigate');
        spyOn(wsService, 'connect').and.callFake(() => ({
          toPromise: () => {
            return Promise.resolve(false);
          }
        }));
        expect(await service.canActivate()).toBeFalsy();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
      })
  );
  it('should connect and proceed to route',
    inject(
      [AuthGuardService, Router, WebsocketService],
      async (service: AuthGuardService, router: Router, wsService: WebsocketService) => {
        spyOn(router, 'navigate');
        spyOn(wsService, 'connect').and.callFake(() => ({
          toPromise: () => {
            return Promise.resolve(true);
          }
        }));
        expect(await service.canActivate()).toEqual(true);
        expect(router.navigate).not.toHaveBeenCalled();
      })
  );
  it('should allow access to / if connected',
    inject(
      [AuthGuardService, Router, WebsocketService],
      async (service: AuthGuardService, router, wsService) => {
        wsService.connected = true;
        spyOn(router, 'navigate');
        expect(await service.canActivate()).toEqual(true);
        expect(router.navigate).not.toHaveBeenCalled();
      })
  );
});
