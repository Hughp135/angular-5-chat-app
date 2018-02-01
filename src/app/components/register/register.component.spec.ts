import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ApiService } from '../../services/api.service';

import { RegisterComponent } from './register.component';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let apiServiceMock: {
    get: jasmine.Spy,
    post: jasmine.Spy,
  };

  beforeEach(async(() => {
    apiServiceMock = {
      get: jasmine.createSpy('get'),
      post: jasmine.createSpy('post'),
    };
    TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ApiService, useValue: apiServiceMock },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;

    // set up GET responses for API calls
    apiServiceMock.post.and.callFake((url: string, data) => {
      if (data.username === 'coolname' && url === 'register') {
        return Observable.of({ success: true });
      } else {
        throw new Error('Invalid API Route');
      }
    });

    fixture.detectChanges();
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
      password_confirm: '123456'
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
      password_confirm: '1234567'
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
      password_confirm: '1234567'
    });

    expect(component.registerForm.valid).toEqual(false);
    expect(component.registerForm.controls['username'].errors.minlength)
      .toEqual({
        requiredLength: 3,
        actualLength: 2
      });
  });
  it('form invalid with non matching pws', () => {
    component.registerForm.patchValue({
      username: 'test',
      password: '1234567',
      password_confirm: '123456'
    });
    expect(component.registerForm.valid).toEqual(false);
    expect(component.registerForm.errors).toEqual({ mismatch: true });
  });
  it('submitting form should POST to /register', () => {
    const formData = {
      username: 'coolname',
      password: '123456',
      password_confirm: '123456'
    };

    component.registerForm.patchValue(formData);
    component.submitForm();
    expect(apiServiceMock.post).toHaveBeenCalledWith(
      'register',
      formData
    );
  });
});
