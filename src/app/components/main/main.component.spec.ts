import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { MainComponent } from './main.component';
import { SettingsService } from '../../services/settings.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MainComponent,
      ],
      imports: [
      ],
      providers: [
        SettingsService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('initial state', async(() => {
    expect(component).toBeTruthy();
  }));
});
