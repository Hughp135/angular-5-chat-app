import { TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

import { AuthGuardService } from './auth-guard.service';

describe('AuthGuardService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [AuthGuardService],
    });
  });

  it('should be created', inject([AuthGuardService], (service: AuthGuardService) => {
    expect(service).toBeTruthy();
  }));
  it('should deny access to /',
    inject(
      [AuthGuardService, Router],
      (service: AuthGuardService, router) => {
        spyOn(router, 'navigate');
        expect(service.canActivate()).toBeFalsy();
        expect(router.navigate).toHaveBeenCalled();
      })
  );
});
