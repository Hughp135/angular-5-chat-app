import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateServerComponent } from './create-server.component';
import { By } from '@angular/platform-browser';
import { SuiModal } from 'ng2-semantic-ui';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';
import 'rxjs/add/observable/throw';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Store } from '@ngrx/store';

describe('CreateServerComponent', () => {
  let component: CreateServerComponent;
  let fixture: ComponentFixture<CreateServerComponent>;
  let apiServiceMock: {
    get: jasmine.Spy,
    post: jasmine.Spy,
  };
  const fakeModalService = {
    approve: () => null,
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
        { provide: Store, useValue: { dispatch: () => { } } },
      ],
      imports: [
        ReactiveFormsModule,
        FormsModule,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateServerComponent);
    component = fixture.componentInstance;
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
  it('does not send request if form invalid', async () => {
    component.form.patchValue({
      name: '',
    });
    expect(component.form.valid).toEqual(false);
    apiServiceMock.post.and.callFake(() => {
      return Observable.of({ success: true });
    });
    await component.createServer();
    expect(component.error).toEqual('Please enter a server name first.');
  });
  it('POSTS to /servers and succeeds', ((done) => {
    const formData = {
      name: 'createServer-test',
      icon: null,
    };

    apiServiceMock.post.and.callFake((url: string, data) => {
      if (url === 'servers') {
        return Observable.of({ success: true }).delay(5);
      }
      throw new Error('Invalid API Route');
    });

    component.form.patchValue(formData);
    component.createServer().then(() => {
      fixture.detectChanges();
      expect(component.loading).toEqual(false);
      done();
    });
    expect(component.loading).toEqual(true);
    expect(apiServiceMock.post).toHaveBeenCalledWith(
      'servers',
      formData,
    );
  }));
  it('submitting form POST to /register fail with specific error message', (done) => {
    const formData = {
      name: 'test-server-2',
      icon: null,
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
    component.createServer().then(() => {
      expect(component.loading).toEqual(false);
      expect(component.error).toEqual('Error thing');
      done();
    });
    expect(component.loading).toEqual(true);
    expect(apiServiceMock.post).toHaveBeenCalledWith(
      'servers',
      formData,
    );
  });
  it('submitting form POST to /register fail with generic error msg', (done) => {
    const formData = {
      name: 'test-server-3',
      icon: null,
    };

    apiServiceMock.post.and.callFake((url: string, data) => {
      if (url === 'servers') {
        return new Observable(subscriber => {
          setTimeout(() => {
            subscriber.error({ error: 'move along now' });
          }, 5);
        });
      }
      throw new Error('Invalid API Route');
    });

    component.form.patchValue(formData);
    component.createServer().then(() => {
      expect(component.loading).toEqual(false);
      expect(component.error).toEqual('A server error occured.');
      done();
    });
    expect(component.loading).toEqual(true);
    expect(apiServiceMock.post).toHaveBeenCalledWith(
      'servers',
      formData,
    );
  });
  it('selecting an image file', (done) => {
    expect(component.cropperImgSrc).toBeUndefined();
    const file = new File(['hi there'], 'filename');
    const event = {
      target: { files: [file] },
    };
    component.onFileChange(event);
    setTimeout(() => {
      expect(component.cropperImgSrc).toBeDefined();
      expect(component.cropperImgSrc).not.toEqual(null);
      done();
    }, 20);
  });
  it('selecting no image file', (done) => {
    expect(component.cropperImgSrc).toBeUndefined();
    const event = {
      target: { files: [] },
    };
    component.onFileChange(event);
    setTimeout(() => {
      expect(component.cropperImgSrc).toEqual(null);
      done();
    });
  });
  it('sets icon field to data url', () => {
    component.setIconField('data:image/jpeg;base64,hi');
    expect(component.form.get('icon').value).toEqual('hi');
  });
  it('resets icon field', () => {
    component.setIconField(undefined);
    expect(component.form.get('icon').value).toEqual(null);
  });
  it('does not set icon field if invalid dataurl given', () => {
    component.setIconField('data:image/png;base64,hi');
    expect(component.form.get('icon').value).toEqual(null);
  });
});
