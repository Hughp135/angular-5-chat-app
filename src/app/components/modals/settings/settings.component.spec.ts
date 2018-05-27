import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { SettingsComponent } from './settings.component';
import { SuiModal } from 'ng2-semantic-ui';
import { SettingsService } from '../../../services/settings.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  const fakeModalService = {
    approve: () => null,
  };


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [
        { provide: SuiModal, useValue: fakeModalService },
        SettingsService,
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
