import { TestBed, async } from '@angular/core/testing';
import { MainComponent } from './main.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('MainComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MainComponent,
      ],
      imports: [ReactiveFormsModule, FormsModule],
      providers: [SettingsService],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));
  it('should create the component', async(() => {
    const fixture = TestBed.createComponent(MainComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
