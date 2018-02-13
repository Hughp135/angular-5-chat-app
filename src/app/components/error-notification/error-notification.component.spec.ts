import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';

import { ErrorNotificationComponent } from './error-notification.component';
import { ErrorService } from '../../services/error.service';
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
  });

  it('initial state', () => {
    expect(component).toBeTruthy();
    expect(component.errorMessage).toBeUndefined();
  });
  it('shows and hides error message', (done) => {
    expect(component.transitionDuration).toEqual(1);
    errorService.errorMessage.next({
      message: 'first message',
      duration: 10,
    });
    expect(component.errorMessage).toEqual('first message');
    setTimeout(() => {
      expect(component.errorMessage).toBeUndefined();
      done();
    }, 20);
  });
  it('doesn\'t hide 2nd error msg if it appears before 1st is hidden', (done) => {
    expect(component.transitionDuration).toEqual(1);
    errorService.errorMessage.next({
      message: 'first message',
      duration: 20,
    });
    expect(component.errorMessage).toEqual('first message');
    errorService.errorMessage.next({
      message: 'second message',
      duration: 60,
    });
    expect(component.errorMessage).toEqual('second message');
    setTimeout(() => {
      // After first message hides
      expect(component.errorMessage).toEqual('second message');
      done();
    }, 40);
  });
  it('errorMessage stays until after transition callback', (done) => {
    component.transitionDuration = 20;
    errorService.errorMessage.next({
      message: 'first message',
      duration: 10,
    });
    expect(component.errorMessage).toEqual('first message');
    setTimeout(() => {
      // After errorMessage duration ends, still in Transition period
      expect(component.errorMessage).toEqual('first message');
      setTimeout(() => {
        // After transition ends
        expect(component.errorMessage).toBeUndefined();
        done();
      }, 20);
    }, 20);
  });
});
