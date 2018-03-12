import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FriendsStore } from '../../reducers/friends-reducer';

@Component({
  selector: 'app-friend-requests',
  templateUrl: './friend-requests.component.html',
  styleUrls: ['./friend-requests.component.scss']
})
export class FriendRequestsComponent implements OnInit {
  public friendsStore: Observable<FriendsStore>;

  constructor(
    private route: ActivatedRoute
  ) {
    route.data.subscribe(data => {
      this.friendsStore = data.state.friends;
    });
  }

  ngOnInit() {
  }

}
