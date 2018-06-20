import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBarComponent } from './status-bar.component';
import { SuiModalService } from 'ng2-semantic-ui';
import { SettingsService } from '../../services/settings.service';
import { StoreModule, Store } from '@ngrx/store';
import { AppState } from '../../reducers/app.states';
import { reducers } from '../../reducers/reducers';
import { SET_ME } from '../../reducers/me-reducer';
import { Me } from '../../../../shared-interfaces/user.interface';

describe('StatusBarComponent', () => {
  let component: StatusBarComponent;
  let fixture: ComponentFixture<StatusBarComponent>;
  let store: Store<AppState>;

  const me: Me = {
    _id: '345', username: 'myname',
  };

  const fakeModalService = {
    open: () => ({
      onApprove: (cb) => cb(),
    }),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StatusBarComponent],
      imports: [
        StoreModule.forRoot(reducers),
      ],
      providers: [
        SettingsService,
        { provide: SuiModalService, useValue: fakeModalService },
      ],
    })
      .compileComponents();
    store = TestBed.get(Store);
    store.dispatch({
      type: SET_ME,
      payload: me,
    });
    fixture = TestBed.createComponent(StatusBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
