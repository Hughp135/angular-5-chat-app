import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendRequestsComponent } from './friend-requests.component';
import { ActivatedRoute } from '@angular/router';
import { FriendsStore } from '../../reducers/friends-reducer';
import { Observable } from 'rxjs/Observable';
import { FriendRequestService } from '../../services/friend-request.service';
import { SettingsService } from '../../services/settings.service';

describe('FriendRequestsComponent', () => {
  let component: FriendRequestsComponent;
  let fixture: ComponentFixture<FriendRequestsComponent>;

  const fakeFriendsService = {
    sendFriendRequest: jasmine.createSpy(),
    rejectFriendRequest: jasmine.createSpy(),
  };

  const friends: FriendsStore = {
    friendRequests: [
      { type: 'incoming', user_id: 'ab1', _id: 'lo1' },
    ],
  };

  const route = {
    data: Observable.of({
      state: {
        channel: Observable.of({}),
        server: Observable.of({}),
        friends: Observable.of(friends),
      },
    }),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FriendRequestsComponent ],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: FriendRequestService, useValue: fakeFriendsService },
        SettingsService,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FriendRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fakeFriendsService.sendFriendRequest.calls.reset();
    fakeFriendsService.rejectFriendRequest.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should send friend request', () => {
    component.confirmAddFriend('123');
    expect(fakeFriendsService.sendFriendRequest).toHaveBeenCalledTimes(1);
  });
  it('should reject friend request', () => {
    component.rejectFriendRequest('123');
    expect(fakeFriendsService.rejectFriendRequest).toHaveBeenCalledTimes(1);
  });
});
