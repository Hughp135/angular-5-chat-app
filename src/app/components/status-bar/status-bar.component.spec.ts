import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBarComponent } from './status-bar.component';
import { SuiModalService } from 'ng2-semantic-ui';
import { SettingsService } from '../../services/settings.service';

describe('StatusBarComponent', () => {
  let component: StatusBarComponent;
  let fixture: ComponentFixture<StatusBarComponent>;
  const fakeModalService = {
    open: () => ({
      onApprove: (cb) => cb(),
    }),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StatusBarComponent],
      providers: [
        SettingsService,
        { provide: SuiModalService, useValue: fakeModalService },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
