import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FriendsStore } from '../../reducers/friends-reducer';
import { FriendRequestService } from '../../services/friend-request.service';
import { SettingsService } from '../../services/settings.service';
import { AddFriendModal } from './add-friend/add-friend.component';
import { SuiModalService } from 'ng2-semantic-ui';
import { User } from 'shared-interfaces/user.interface';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-friend-requests',
  templateUrl: './friend-requests.component.html',
  styleUrls: ['./friend-requests.component.scss'],
})
export class FriendRequestsComponent implements OnInit, OnDestroy {
  public friendsStore: Observable<FriendsStore>;
  public friendRequests: User['friend_requests'];
  public incomingFriendRequests: User['friend_requests'];
  private subscriptions: Subscription[];

  constructor(
    private route: ActivatedRoute,
    private friendRequestService: FriendRequestService,
    public settingsService: SettingsService,
    private modalService: SuiModalService,
  ) {
    this.route.data.subscribe(data => {
      this.friendsStore = data.state.friends;
      const sub = data.state.friends.subscribe((friendsStore: FriendsStore) => {
        this.friendRequests = friendsStore.friendRequests;
        this.incomingFriendRequests = friendsStore.friendRequests
          .filter(friendRequest => friendRequest.type === 'incoming');
      });
      this.subscriptions = [sub];
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  openAddFriendModal() {
    this.modalService
      .open(new AddFriendModal())
      .onApprove((id: string) => {
        this.confirmAddFriend(id);
      });
  }

  confirmAddFriend(userId: string) {
    this.friendRequestService.sendFriendRequest(userId);
  }

  rejectFriendRequest(userId: string) {
    this.friendRequestService.rejectFriendRequest(userId);
  }
}
