import { Component, OnInit, OnDestroy } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ChatChannel, ChannelList } from 'shared-interfaces/channel.interface';
import ChatServer from 'shared-interfaces/server.interface';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss', '../../styles/layout.scss']
})
export class FriendsComponent implements OnInit, OnDestroy {
  public currentChatChannel: Observable<ChatChannel>;
  public currentServer: Observable<ChatServer>;
  private channelList: ChannelList;
  private subscriptions: Array<Subscription> = [];

  constructor(
    public settingsService: SettingsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.route.data
      .subscribe((data) => {
        this.currentChatChannel = data.state.channel;
        this.currentServer = data.state.server;
        this.subscriptions.push(
          data.state.server
            .filter(server => server._id === 'friends')
            .subscribe(server => {
              this.channelList = server.channelList;
            })
        );
      });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit() {
  }

  joinChannel(channel: ChatChannel) {
    this.router.navigate([`friends/${channel._id}`]);
  }

  getChannelName(channel: ChatChannel) {
    // console.log(channel);
    const userId = channel.user_ids[1];
    const user = this.channelList.users[userId];
    return user ? user.username : 'Unknown';
  }
}
