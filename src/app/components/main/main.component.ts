import { Component } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { AppStateService } from '../../services/app-state.service';
import { Observable } from 'rxjs/Observable';
import ChatServer from 'shared-interfaces/server.interface';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers/app.states';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  public currentServer: Observable<ChatServer>;
  constructor(
    public settingsService: SettingsService,
    private store: Store<AppState>
  ) {
    this.currentServer = this.store.select(state => state.currentServer);
  }
}
