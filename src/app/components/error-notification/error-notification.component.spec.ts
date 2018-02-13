import { async, ComponentFixture, TestBed, getTestBed, fakeAsync, tick } from '@angular/core/testing';

import { ErrorNotificationComponent } from './error-notification.component';
import { ErrorService, ErrorNotification } from '../../services/error.service';
import { SuiModule } from 'ng2-semantic-ui';

describe('ErrorNotificationComponent', () => {
  let component: ErrorNotificationComponent;
  let fixture: ComponentFixture<ErrorNotificationComponent>;
  let injector: TestBed;
  let errorService: ErrorService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ErrorNotificationComponent],
      providers: [ErrorService],
      imports: [SuiModule],
    })
      .compileComponents();
    injector = getTestBed();
    errorService = injector.get(ErrorService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorNotificationComponent);
    component = fixture.componentInstance;
    component.doAnimate = jasmine.createSpy()
      .and.callFake((direction, cb) => {
        if (cb) {
          cb();
        }
      });
    component.transitionDuration = 1;
    fixture.detectChanges();
    console.log('end beforeEach');
  });

  afterEach(fakeAsync(() => {
  }));

  it('initial state', () => {
    expect(component).toBeTruthy();
    expect(component.errorNotification).toBeUndefined();
  });
  it('shows and hides error message', fakeAsync(() => {
    expect(component.transitionDuration).toEqual(1);
    errorService.errorMessage
      .next(new ErrorNotification('first message', 10));
    tick(2);
    expect(component.errorNotification.message).toEqual('first message');
    fixture.detectChanges();
    tick(20);
    // After first message hides
    expect(component.errorNotification).toBeUndefined();
    expect(component.doAnimate).toHaveBeenCalledTimes(2);
    console.log('1st test finished');
  }));
  it('doesn\'t hide if error id doesn\'t match', fakeAsync(() => {
    expect(component.transitionDuration).toEqual(1);
    errorService.errorMessage
      .next(new ErrorNotification('first message', 10));
    tick(2);
    expect(component.doAnimate).toHaveBeenCalledTimes(1);
    expect(component.errorNotification.message).toEqual('first message');
    component.errorNotification.id = '123';
    fixture.detectChanges();
    tick(20);
    expect(component.doAnimate).toHaveBeenCalledTimes(1);
    // After first message hides
  }));
  fit('errorMessage stays until after transition callback', fakeAsync(() => {
    component.doAnimate = jasmine.createSpy()
      .and.callFake((direction, cb) => {
        if (cb) {
          setTimeout(cb, 20);
        }
      });
    component.transitionDuration = 500;
    errorService.errorMessage
      .next(new ErrorNotification('first message', 10));
    expect(component.errorNotification.message).toEqual('first message');
    expect(component.doAnimate).toHaveBeenCalledTimes(1);
    tick(20);
    // After error duration ends, but still transitioning.
    expect(component.errorNotification.message).toEqual('first message');
    // After transition ends
    tick(30);
    expect(component.errorNotification).toBeUndefined();
    expect(component.doAnimate).toHaveBeenCalledTimes(2);
  }));
});
