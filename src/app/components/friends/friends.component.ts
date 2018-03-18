import { Component, OnInit, OnDestroy } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ChatChannel, ChannelList } from 'shared-interfaces/channel.interface';
import ChatServer from 'shared-interfaces/server.interface';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { FriendsStore } from '../../reducers/friends-reducer';
import { User } from 'shared-interfaces/user.interface';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss', '../../styles/layout.scss'],
})
export class FriendsComponent implements OnInit, OnDestroy {
  public currentChatChannel: Observable<ChatChannel>;
  public currentServer: Observable<ChatServer>;
  public incomingFriendRequests: User['friend_requests'];
  public friendRequests: User['friend_requests'];
  private subscriptions: Array<Subscription> = [];

  constructor(
    public settingsService: SettingsService,
    private route: ActivatedRoute,
  ) {
    this.route.data
      .subscribe((data) => {
        this.currentChatChannel = data.state.channel;
        this.currentServer = data.state.server;
        const friendsSub = data.state.friends.subscribe((friendsStore: FriendsStore) => {
          this.friendRequests = friendsStore.friendRequests;
          this.incomingFriendRequests = friendsStore.friendRequests
            .filter(friendRequest => friendRequest.type === 'incoming');
        });
        this.subscriptions = [friendsSub];
      });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit() {
  }
}
