import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { MainComponent } from './main.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AppStateService } from '../../services/app-state.service';
import { StoreModule, Store } from '@ngrx/store';
import { reducers } from '../../reducers/reducers';
import { AppState } from '../../reducers/app.states';

describe('MainComponent', () => {
  let store: Store<AppState>;
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MainComponent,
      ],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        StoreModule.forRoot(reducers),
      ],
      providers: [SettingsService, AppStateService],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    store = TestBed.get(Store);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('initial state', async(() => {
    expect(component).toBeTruthy();
    component.currentServer.subscribe(server => {
      expect(server).toBeUndefined();
    });
  }));
});
