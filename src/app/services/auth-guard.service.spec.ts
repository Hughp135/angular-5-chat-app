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
  it('should deny access to / and redirect to /login if not connected',
    inject(
      [AuthGuardService, Router],
      async (service: AuthGuardService, router) => {
        spyOn(router, 'navigate');
        expect(await service.canActivate()).toBeFalsy();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
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
