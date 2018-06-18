import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';

describe('SettingsService when user_settings is not set', () => {
  let service: SettingsService;
  beforeEach(() => {
    localStorage.removeItem('user_settings');
    TestBed.configureTestingModule({
      providers: [SettingsService],
    });
    service = TestBed.get(SettingsService);
  });

  it('should be created + initial state', () => {
    expect(service).toBeTruthy();
    expect(service.invertedThemeSubj.getValue()).toEqual(false);
  });
  it('setter invertedTheme changes subject value', () => {
    service.invertedTheme = true;
    expect(service.invertedThemeSubj.getValue()).toEqual(true);
  });
  it('should be created + initial state', () => {
    expect(service).toBeTruthy();
    expect(service.invertedThemeSubj.getValue()).toEqual(false);
  });
});

describe('SettingsService when user_settings is set', () => {
  let service: SettingsService;
  beforeEach(() => {
    localStorage.setItem('user_settings', JSON.stringify({
      invertedTheme: true,
    }));
    TestBed.configureTestingModule({
      providers: [SettingsService],
    });
    service = TestBed.get(SettingsService);
  });

  it('should be created + initial state', () => {
    expect(service).toBeTruthy();
    expect(service.invertedThemeSubj.getValue()).toEqual(true);
  });
  it('set invertedTheme calls next invertedThemeSubj', () => {
    service.invertedTheme = false;
    expect(service.invertedThemeSubj.getValue()).toEqual(false);
  });
});

describe('SettingsService when user_settings is invalid json', () => {
  let service: SettingsService;
  beforeEach(() => {
    localStorage.setItem('user_settings', 'some-string');
    TestBed.configureTestingModule({
      providers: [SettingsService],
    });
    service = TestBed.get(SettingsService);
  });

  it('should be created + initial state', () => {
    expect(service).toBeTruthy();
    expect(service.invertedThemeSubj.getValue()).toEqual(false);
  });
  it('localStorage should not have user_settings key', () => {
    expect(service).toBeTruthy();
    expect(localStorage.getItem('user_settings')).toEqual(null);
  });
});

