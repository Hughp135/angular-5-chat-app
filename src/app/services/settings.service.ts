import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

const SETTINGS_STORAGE_KEY = 'user_settings';

@Injectable()
export class SettingsService {
  public invertedThemeSubj: BehaviorSubject<boolean>
    = new BehaviorSubject(false);

  constructor() {
    this.loadSettings();
  }

  loadSettings() {
    const settings = this.getExistingSettings();
    if (!settings) {
      return;
    }

    if (settings.invertedTheme === true) {
      this.invertedTheme = true;
    }
  }

  saveSetting(key, val) {
    const existing = this.getExistingSettings();
    const newSettings = {
      ...existing,
      [key]: val,
    };

    const stringified = JSON.stringify(newSettings);
    localStorage.setItem(SETTINGS_STORAGE_KEY, stringified);
  }

  getExistingSettings() {
    const existingSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);

    try {
      return JSON.parse(existingSettings);
    } catch (e) {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      return null;
    }
  }


  // Triggered when settingsService.invertedTheme is changed
  set invertedTheme(enabled: boolean) {
    this.invertedThemeSubj.next(enabled);
    this.saveSetting('invertedTheme', enabled);
  }

  // Used as ngModel value across various components
  get invertedTheme() {
    return this.invertedThemeSubj.getValue();
  }
}
