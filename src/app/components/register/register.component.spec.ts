import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from '../../services/api.service';

import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [ReactiveFormsModule],
      providers: [ApiService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    injector = getTestBed();
    service = injector.get(ApiService);
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
});
