import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ChatChannel } from 'shared-interfaces/channel.interface';
import ChatServer from 'shared-interfaces/server.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss', '../../styles/layout.scss']
})
export class FriendsComponent implements OnInit {
  public currentChatChannel: Observable<ChatChannel>;
  public currentServer: Observable<ChatServer>;

  constructor(
    public settingsService: SettingsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.route.data
      .subscribe((data) => {
        this.currentChatChannel = data.state.channel;
        this.currentServer = data.state.server;
      });
  }

  ngOnInit() {
  }

  joinChannel(channel: ChatChannel) {
    this.router.navigate([`channels/${channel.server_id}/${channel._id}`]);
  }

}
