import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { LoginComponent } from './login.component';
import { ApiService } from '../../services/api.service';
import { WebsocketService } from '../../services/websocket.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let injector: TestBed;
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        ApiService,
        { provide: WebsocketService, useValue: { connect: () => null } },
      ],
    })
      .compileComponents();
    injector = getTestBed();
    service = injector.get(ApiService);
    httpMock = injector.get(HttpTestingController);
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
  it('successful login', () => {
    const formData = {
      username: 'coolname',
      password: '123456'
    };
    component.loginForm.patchValue(formData);
    component.submitForm();
    expect(component.submitting).toEqual(true);
    const called = httpMock.expectOne(`${service.BASE_URL}login`);
    expect(called.request.method).toBe('POST');
    called.flush(null, { status: 204, statusText: 'No Content' });
    expect(component.submitting).toEqual(false);
  });
  it('failed login with 401 & error.error', () => {
    const formData = {
      username: 'coolname',
      password: '12345',
    };
    const mockResponse = { error: 'Failed' };
    component.loginForm.patchValue(formData);
    component.submitForm();
    expect(component.submitting).toEqual(true);
    const called = httpMock.expectOne(`${service.BASE_URL}login`);
    expect(called.request.method).toBe('POST');
    called.flush(mockResponse, { status: 401, statusText: 'Unauthorized' });
    expect(component.submitting).toEqual(false);
    expect(component.error).toEqual('Failed');
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
  it('failed login followed by successful login', () => {
    const formData = {
      username: 'coolname',
      password: '12345',
    };
    const mockResponse = { error: 'Failed' };
    component.loginForm.patchValue(formData);
    component.submitForm();
    expect(component.submitting).toEqual(true);
    const called = httpMock.expectOne(`${service.BASE_URL}login`);
    expect(called.request.method).toBe('POST');
    called.flush(mockResponse, { status: 401, statusText: 'Unauthorized' });
    expect(component.submitting).toEqual(false);
    expect(component.error).toEqual('Failed');

    // 2nd request
    component.submitForm();
    expect(component.submitting).toEqual(true);
    expect(component.error).toBeNull();
    const secondcall = httpMock.expectOne(`${service.BASE_URL}login`);
    secondcall.flush({ token : '12345' });
    expect(component.submitting).toEqual(false);
    expect(component.error).toBeNull();
  });
});
