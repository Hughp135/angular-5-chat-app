import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { LoginComponent } from './login.component';
import { ApiService } from '../../services/api.service';
import { WebsocketService } from '../../services/websocket.service';
import { Router } from '@angular/router';

// tslint:disable:no-unused-expression

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let injector: TestBed;
  let service: ApiService;
  let httpMock: HttpTestingController;
  let router: Router;
  let socketService: WebsocketService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        ApiService,
        WebsocketService,
      ],
    })
      .compileComponents();
    injector = getTestBed();
    service = injector.get(ApiService);
    socketService = injector.get(WebsocketService);
    httpMock = injector.get(HttpTestingController);
    router = injector.get(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('initial state', () => {
    expect(component.submitting).toEqual(false);
    expect(component.error).toBeNull;
  });
  it('successful login + successful socket connection', async (done) => {
    spyOn(socketService, 'connect').and.callFake(() => {
      return {
        toPromise: () => {
          return Promise.resolve(true);
        }
      };
    });
    const formData = {
      username: 'coolname',
      password: '123456'
    };
    component.loginForm.patchValue(formData);
    component.submitForm();
    expect(component.submitting).toEqual(true);
    const called = httpMock.expectOne(`${service.BASE_URL}login`);
    expect(called.request.method).toBe('POST');
    await called.flush(null, { status: 204, statusText: 'No Content' });
    setTimeout(() => {
      // After socket connection
      expect(component.submitting).toEqual(false);
      expect(component.error).toBeNull();
      done();
    }, 10);
  });
  it('successful login successful + failed socket connection', async (done) => {
    const formData = {
      username: 'coolname',
      password: '123456'
    };
    const socketSpy = spyOn(socketService, 'connect').and.callFake(() => {
      return {
        toPromise: () => {
          return Promise.resolve(false);
        }
      };
    });
    spyOn(router, 'navigate');
    component.loginForm.patchValue(formData);
    component.submitForm();
    expect(component.submitting).toEqual(true);
    const called = httpMock.expectOne(`${service.BASE_URL}login`);
    expect(called.request.method).toBe('POST');
    await called.flush(null, { status: 204, statusText: 'No Content' });
    expect(socketSpy).toHaveBeenCalled();
    setTimeout(() => {
      // After socket connection
      expect(component.submitting).toEqual(false);
      expect(router.navigate).not.toHaveBeenCalled();
      expect(component.error).toEqual('Unable to establish a connection.');
      done();
    }, 10);
  });
  it('failed login with 401 & error.error', async () => {
    const formData = {
      username: 'coolname',
      password: '12345',
    };
    const socketSpy = spyOn(socketService, 'connect');
    spyOn(router, 'navigate');
    const mockResponse = { error: 'Failed' };
    component.loginForm.patchValue(formData);
    component.submitForm();
    expect(component.submitting).toEqual(true);
    const called = httpMock.expectOne(`${service.BASE_URL}login`);
    expect(called.request.method).toBe('POST');
    await called.flush(mockResponse, { status: 401, statusText: 'Unauthorized' });
    expect(component.submitting).toEqual(false);
    expect(component.error).toEqual('Failed');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(socketSpy).not.toHaveBeenCalled();
  });
  it('failed login with 500 error', () => {
    const formData = {
      username: 'coolname',
      password: '12345',
    };
    const mockResponse = {};
    component.loginForm.patchValue(formData);
    component.submitForm();
    expect(component.submitting).toEqual(true);
    const called = httpMock.expectOne(`${service.BASE_URL}login`);
    expect(called.request.method).toBe('POST');
    called.flush(mockResponse, { status: 500, statusText: 'Server Error' });
    expect(component.submitting).toEqual(false);
    expect(component.error).toEqual('Sorry, a server error occured. Please try again.');
  });
  it('failed login followed by successful login', async (done) => {
    const formData = {
      username: 'coolname',
      password: '12345',
    };
    const socketSpy = spyOn(socketService, 'connect').and.callFake(() => {
      return {
        toPromise: () => {
          return Promise.resolve(true);
        }
      };
    });
    const mockResponse = { error: 'Failed' };
    component.loginForm.patchValue(formData);
    component.submitForm();
    expect(component.submitting).toEqual(true);
    const called = httpMock.expectOne(`${service.BASE_URL}login`);
    expect(called.request.method).toBe('POST');
    await called.flush(mockResponse, { status: 401, statusText: 'Unauthorized' });
    setTimeout(async () => {
      expect(component.submitting).toEqual(false);
      expect(component.error).toEqual('Failed');
      expect(socketSpy).not.toHaveBeenCalled();
      // 2nd request
      component.submitForm();
      expect(component.submitting).toEqual(true);
      expect(component.error).toBeNull();
      const secondcall = httpMock.expectOne(`${service.BASE_URL}login`);
      await secondcall.flush({ token: '12345' });
      setTimeout(() => {
        expect(socketSpy).toHaveBeenCalled();
        expect(component.submitting).toEqual(false);
        expect(component.error).toBeNull();
        done();
      }, 10);
    }, 10);
  });
});
