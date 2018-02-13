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
    component.transitionDuration = 1;
    fixture.detectChanges();
    console.log('end beforeEach');
  });

  afterEach(fakeAsync(() => {
    tick(100);
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
    console.log('1st test finished');
  }));
  it('doesn\'t hide 2nd error msg if it appears before 1st is hidden', fakeAsync(() => {
    console.log('2nd test started');
    component.transitionDuration = 50;
    errorService.errorMessage
      .next(new ErrorNotification('first message', 100));
    expect(component.errorNotification.message).toEqual('first message');
    tick(2);
    errorService.errorMessage
      .next(new ErrorNotification('second message', 200));
    expect(component.errorNotification.message).toEqual('second message');
    fixture.detectChanges();
    tick(150);
    // After first message hides
    console.log('Making assertion');
    expect(component.errorNotification.message).toEqual('second message');
    // After second message hides
    tick(150);
    expect(component.errorNotification).toBeUndefined();
  }));
  it('errorMessage stays until after transition callback', fakeAsync(() => {
    component.transitionDuration = 20;
    errorService.errorMessage
      .next(new ErrorNotification('first message', 10));
    expect(component.errorNotification.message).toEqual('first message');
    fixture.detectChanges();
    tick(20);
    // After errorMessage duration ends, still in Transition period
    expect(component.errorNotification.message).toEqual('first message');
    // After transition ends
    tick(20);
    expect(component.errorNotification).toBeUndefined();
  }));
});
