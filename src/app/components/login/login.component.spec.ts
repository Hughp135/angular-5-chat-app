import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { LoginComponent } from './login.component';
import { ApiService } from '../../services/api.service';

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
    expect(component.error).toEqual(null);
  });
  it('successful login', () => {
    const formData = {
      username: 'coolname',
      password: '123456'
    };
    const mockResponse = { token: '12345asdasd' };
    component.loginForm.patchValue(formData);
    component.submitForm();
    expect(component.submitting).toEqual(true);
    const called = httpMock.expectOne(`${service.BASE_URL}login`);
    expect(called.request.method).toBe('POST');
    called.flush(mockResponse);
    expect(component.submitting).toEqual(false);
  });
  it('failed login', () => {
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
