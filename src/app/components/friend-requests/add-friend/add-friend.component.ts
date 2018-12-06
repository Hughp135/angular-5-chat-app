import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SuiModal, ComponentModalConfig, ModalSize } from 'ng2-semantic-ui';
import { ApiService } from '../../../services/api.service';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

@Component({
  selector: 'app-add-friend',
  templateUrl: './add-friend.component.html',
  styleUrls: ['./add-friend.component.scss'],
})
export class AddFriendComponent implements OnInit {
  userToAdd: { _id: string; username: string };
  loading = false;
  error: string;
  form: FormGroup = new FormGroup({
    username: new FormControl(),
  });

  constructor(public modal: SuiModal<void, string>, private apiService: ApiService) {}

  confirmAddFriend() {
    this.modal.approve(this.userToAdd._id);
  }

  ngOnInit() {
    this.form
      .get('username')
      .valueChanges.debounceTime(1000)
      .distinctUntilChanged()
      .subscribe(data => {
        this.searchForUser();
      });
  }

  searchForUser() {
    const username = this.form.get('username').value;
    if (!username) {
      return;
    }
    this.userToAdd = null;
    this.loading = true;
    this.error = null;

    this.apiService.get(`users/${username}`).subscribe(
      (data: any) => {
        this.userToAdd = data.user;
        this.onSearchComplete();
      },
      err => {
        this.onSearchComplete(err);
      },
    );
  }

  onSearchComplete(err?) {
    if (err) {
      if (err.status === 404) {
        this.error = 'No user was found with that username. Sure it\'s spelled right? :P';
      } else if (err.status === 401) {
        this.error = 'You are not logged in. Please try re-logging in.';
      } else {
        this.error = 'Something went wrong. Please try again.';
      }
    }
    this.loading = false;
  }
}

/* istanbul ignore next */
export class AddFriendModal extends ComponentModalConfig<void, void, void> {
  constructor() {
    super(AddFriendComponent);
    this.size = ModalSize.Tiny;
  }
}
