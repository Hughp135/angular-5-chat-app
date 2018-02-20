import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { CreateServerComponent } from './create-server.component';
import { By } from '@angular/platform-browser';
import { SuiModal } from 'ng2-semantic-ui';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';
import 'rxjs/add/observable/throw';

describe('CreateServerComponent', () => {
  let component: CreateServerComponent;
  let fixture: ComponentFixture<CreateServerComponent>;
  let apiServiceMock: {
    get: jasmine.Spy,
    post: jasmine.Spy,
  };
  const fakeModalService = {
    approve: () => null
  };
  beforeEach(async(() => {
    apiServiceMock = {
      get: jasmine.createSpy('get'),
      post: jasmine.createSpy('post'),
    };
    TestBed.configureTestingModule({
      declarations: [CreateServerComponent],
      providers: [
        { provide: SuiModal, useValue: fakeModalService },
        { provide: ApiService, useValue: apiServiceMock },
      ],
      imports: [
        ReactiveFormsModule,
        FormsModule
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateServerComponent);
    component = fixture.componentInstance;
    // (component as any).
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('create button disabled initially', () => {
    const button = fixture.debugElement.query(By.css('button.green')).nativeElement;
    expect(button.disabled).toEqual(true);
  });
  it('form valid with correct data', () => {
    component.form.patchValue({
      name: 'test',
    });
    expect(component.form.valid).toEqual(true);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button.green')).nativeElement;
    expect(button.disabled).toEqual(false);
  });
  it('form valid with server name < 3 characters', () => {
    component.form.patchValue({
      name: 'ta',
    });
    expect(component.form.valid).toEqual(false);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button.green')).nativeElement;
    expect(button.disabled).toEqual(true);
  });
  it('does not send request if form invalid', () => {
    component.form.patchValue({
      name: '',
    });
    expect(component.form.valid).toEqual(false);
    component.createServer();
    expect(component.error).toEqual('Please enter a server name first.');
  });
  it('POSTS to /servers and succeeds', fakeAsync(() => {
    const formData = {
      name: 'createServer-test',
    };

    apiServiceMock.post.and.callFake((url: string, data) => {
      if (url === 'servers') {
        return Observable.of({ success: true }).delay(1);
      }
      throw new Error('Invalid API Route');
    });

    component.form.patchValue(formData);
    component.createServer();
    expect(component.loading).toEqual(true);
    expect(apiServiceMock.post).toHaveBeenCalledWith(
      'servers',
      formData
    );
    // After fake API response
    tick(50);
    expect(component.loading).toEqual(false);
  }));
  it('submitting form POST to /register fail', fakeAsync(() => {
    const formData = {
      name: 'test-server-2'
    };

    apiServiceMock.post.and.callFake((url: string, data) => {
      if (url === 'servers') {
        return new Observable(subscriber => {
          setTimeout(() => {
            subscriber.error({ error: { error: 'Error thing' } });
          }, 5);
        });
      }
      throw new Error('Invalid API Route');
    });

    component.form.patchValue(formData);
    component.createServer();
    expect(component.loading).toEqual(true);
    expect(apiServiceMock.post).toHaveBeenCalledWith(
      'servers',
      formData
    );
    // After fake API response
    tick(50);
    expect(component.loading).toEqual(false);
    expect(component.error).toEqual('Error thing');
  }));
});
