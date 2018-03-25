import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class SettingsService {
  public invertedThemeSubj = new BehaviorSubject(false);

  constructor() {  }

  set invertedTheme(enabled: boolean) {
    this.invertedThemeSubj.next(enabled);
  }

  get invertedTheme() {
    return this.invertedThemeSubj.getValue();
  }
}
