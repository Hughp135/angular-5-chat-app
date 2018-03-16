import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import ChatServer from 'shared-interfaces/server.interface';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute } from '@angular/router';
import { ChatChannel } from 'shared-interfaces/channel.interface';

@Component({
  selector: 'app-view-server',
  templateUrl: './view-server.component.html',
  styleUrls: ['./view-server.component.scss', '../../styles/layout.scss'],
})
export class ViewServerComponent implements OnInit {
  public currentServer: Observable<ChatServer>;
  public currentChatChannel: Observable<ChatChannel>;

  constructor(
    public settingsService: SettingsService,
    private route: ActivatedRoute,
  ) {
    this.route.data
      .subscribe((data) => {
        this.currentServer = data.state.server;
        this.currentChatChannel = data.state.channel;
      });
  }

  ngOnInit() {
  }

}
