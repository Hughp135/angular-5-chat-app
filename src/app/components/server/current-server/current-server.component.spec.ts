import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';

import { CurrentServerComponent } from './current-server.component';
import { AppStateService } from '../../../services/app-state.service';

describe('CurrentServerComponent', () => {
  let component: CurrentServerComponent;
  let fixture: ComponentFixture<CurrentServerComponent>;
  let injector: TestBed;
  let appState: AppStateService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentServerComponent ],
      providers: [
        AppStateService
      ],
    })
    .compileComponents();
    injector = getTestBed();
    appState = injector.get(AppStateService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('initial state', () => {
    expect(component).toBeTruthy();
  });
});
