import { Component } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { Observable } from 'rxjs/Observable';
import ChatServer from 'shared-interfaces/server.interface';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers/app.states';
import { ChatChannel } from 'shared-interfaces/channel.interface';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  public currentServer: Observable<ChatServer>;
  public currentChatChannel: Observable<ChatChannel>;

  constructor(
    public settingsService: SettingsService,
    private store: Store<AppState>
  ) {
    this.currentServer = this.store.select(state => state.currentServer);
    this.currentChatChannel = this.store.select(state => state.currentChatChannel);
  }
}
