import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SettingsService]
    });
    service = TestBed.get(SettingsService);
  });

  it('should be created + initial state', () => {
    expect(service).toBeTruthy();
    expect(service.invertedThemeSubj.getValue()).toEqual(false);
  });
  it('setInvertedTheme calls next invertedThemeSubj', () => {
    service.invertedTheme = true;
    expect(service.invertedThemeSubj.getValue()).toEqual(true);
  });
});
