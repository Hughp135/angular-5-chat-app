import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FriendsStore } from '../../reducers/friends-reducer';
import { FriendRequestService } from '../../services/friend-request.service';
import { SettingsService } from '../../services/settings.service';
import { AddFriendModal } from './add-friend/add-friend.component';
import { SuiModalService } from 'ng2-semantic-ui';

@Component({
  selector: 'app-friend-requests',
  templateUrl: './friend-requests.component.html',
  styleUrls: ['./friend-requests.component.scss'],
})
export class FriendRequestsComponent implements OnInit {
  public friendsStore: Observable<FriendsStore>;

  constructor(
    private route: ActivatedRoute,
    private friendRequestService: FriendRequestService,
    public settingsService: SettingsService,
    private modalService: SuiModalService,
  ) {
    this.route.data.subscribe(data => {
      this.friendsStore = data.state.friends;
    });
  }

  ngOnInit() {
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
