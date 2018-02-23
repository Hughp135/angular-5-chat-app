import { Component } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { Observable } from 'rxjs/Observable';
import ChatServer from 'shared-interfaces/server.interface';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers/app.states';
import { ChatChannel } from 'shared-interfaces/channel.interface';
import { ActivatedRoute } from '@angular/router';
import { ParamMap } from '@angular/router';
import 'rxjs/add/operator/switchMap';

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
    private store: Store<AppState>,
    private route: ActivatedRoute,
  ) {
    this.currentServer = this.store.select(state => state.currentServer);
    this.currentChatChannel = this.store.select(state => state.currentChatChannel);
    this.route.paramMap.switchMap((params: ParamMap) => {
      console.log('params', params.get('id'));
      return 'got something';
    });
  }
}
