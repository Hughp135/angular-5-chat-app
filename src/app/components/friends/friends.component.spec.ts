import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendsComponent } from './friends.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SettingsService } from '../../services/settings.service';

describe('FriendsComponent', () => {
  let component: FriendsComponent;
  let fixture: ComponentFixture<FriendsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FriendsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        SettingsService,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FriendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
