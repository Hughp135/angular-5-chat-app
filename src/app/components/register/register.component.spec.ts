import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ApiService } from '../../services/api.service';
import { RouterTestingModule } from '@angular/router/testing';

import { RegisterComponent } from './register.component';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';
import 'rxjs/add/observable/throw';
import { ErrorService } from '../../services/error.service';
import { WebsocketService } from '../../services/websocket.service';
import { Router } from '@angular/router';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let apiServiceMock: {
    get: jasmine.Spy,
    post: jasmine.Spy,
  };
  let router: Router;
  const fakeWebSocketService = {
    connect: jasmine.createSpy(),
  };

  beforeEach(async(() => {
    apiServiceMock = {
      get: jasmine.createSpy('get'),
      post: jasmine.createSpy('post'),
    };
    TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceMock },
        ErrorService,
        { provide: WebsocketService, useValue: fakeWebSocketService },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.get(Router);
    fakeWebSocketService.connect.and.callFake(() => ({
      toPromise: () => {
        return Promise.resolve(true);
      },
    }));
    apiServiceMock.post.and.callFake((url: string, data) => {
      if (url === 'register') {
        return Observable.of({ success: true }).delay(1);
      }
      throw new Error('Invalid API Route');
    });
    spyOn(router, 'navigate');
  });

  afterEach(() => {
    fakeWebSocketService.connect.calls.reset();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });
  it('login button disabled initially', () => {
    const button = fixture.debugElement.query(By.css('button.primary')).nativeElement;
    expect(button.disabled).toEqual(true);
  });
  it('form valid with correct data', () => {
    component.registerForm.patchValue({
      username: 'test',
      password: '123456',
      password_confirm: '123456',
    });
    expect(component.registerForm.valid).toEqual(true);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button.primary')).nativeElement;
    expect(button.disabled).toEqual(false);
  });
  it('form invalid with empty username', () => {
    component.registerForm.patchValue({
      username: '',
      password: '1234567',
      password_confirm: '1234567',
    });
    component.registerForm.controls['username'].updateValueAndValidity();
    expect(component.registerForm.valid).toEqual(false);
    expect(component.registerForm.controls['username'].errors.required)
      .toEqual(true);
  });
  it('form invalid with invalid username', () => {
    component.registerForm.patchValue({
      username: 'as',
      password: '1234567',
      password_confirm: '1234567',
    });

    expect(component.registerForm.valid).toEqual(false);
    expect(component.registerForm.controls['username'].errors.minlength)
      .toEqual({
        requiredLength: 3,
        actualLength: 2,
      });
  });
  it('form invalid with non matching pws', () => {
    component.registerForm.patchValue({
      username: 'test',
      password: '1234567',
      password_confirm: '123456',
    });
    expect(component.registerForm.valid).toEqual(false);
    expect(component.registerForm.errors).toEqual({ mismatch: true });
  });
  it('POSTS to /register and succeeds', (done) => {
    const formData = {
      username: 'coolname',
      password: '123456',
      password_confirm: '123456',
    };

    component.registerForm.patchValue(formData);
    component.submitForm();
    expect(component.submitting).toEqual(true);
    expect(apiServiceMock.post).toHaveBeenCalledWith(
      'register',
      formData,
    );
    // After fake API response
    setTimeout(() => {
      expect(component.submitting).toEqual(false);
      done();
    }, 5);
  });
  it('submitting form POST to /register fail', (done) => {
    const formData = {
      username: 'badname',
      password: '123456',
      password_confirm: '123456',
    };

    apiServiceMock.post.and.callFake((url: string, data) => {
      if (url === 'register') {
        return new Observable(subscriber => {
          setTimeout(() => {
            subscriber.error({ error: { error: 'Error thing' } });
          }, 1);
        });
      }
      throw new Error('Invalid API Route');
    });

    component.registerForm.patchValue(formData);
    component.submitForm();
    expect(component.submitting).toEqual(true);
    expect(apiServiceMock.post).toHaveBeenCalledWith(
      'register',
      formData,
    );
    // After fake API response
    setTimeout(() => {
      expect(component.submitting).toEqual(false);
      expect(component.error).toEqual('Error thing');
      done();
    }, 5);
  });
  it('submitting form POST to /register fail with no message', (done) => {
    const formData = {
      username: 'badname',
      password: '123456',
      password_confirm: '123456',
    };

    apiServiceMock.post.and.callFake((url: string, data) => {
      if (url === 'register') {
        return new Observable(subscriber => {
          setTimeout(() => {
            subscriber.error(new Error());
          }, 1);
        });
      }
      throw new Error('Invalid API Route');
    });

    component.registerForm.patchValue(formData);
    component.submitForm();
    expect(component.submitting).toEqual(true);
    expect(apiServiceMock.post).toHaveBeenCalledWith(
      'register',
      formData,
    );
    // After fake API response
    setTimeout(() => {
      expect(component.submitting).toEqual(false);
      expect(component.error).toEqual('Sorry, a server error occured. Please try again.');
      done();
    }, 5);
  });
  it('After successful registration, redirects to /', (done) => {
    const formData = {
      username: 'coolname',
      password: '123456',
      password_confirm: '123456',
    };

    component.registerForm.patchValue(formData);
    component.submitForm();
    // After fake API response
    setTimeout(() => {
      expect(component.success).toEqual(true);
      expect(component.submitting).toEqual(false);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
      done();
    }, 5);
  });
  it('After successful registration, and connecting fails, display error', (done) => {
    fakeWebSocketService.connect.and.callFake(() => ({
      toPromise: () => {
        return Promise.resolve(false);
      },
    }));
    const formData = {
      username: 'coolname',
      password: '123456',
      password_confirm: '123456',
    };

    component.registerForm.patchValue(formData);
    component.submitForm();
    // After fake API response
    setTimeout(() => {
      expect(component.success).toEqual(true);
      expect(component.error).toEqual('Your account was created but logging in failed. Please try logging in manually.');
      expect(component.submitting).toEqual(false);
      expect(router.navigate).not.toHaveBeenCalled();
      done();
    }, 5);
  });
});
