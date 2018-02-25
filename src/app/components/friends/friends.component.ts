import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss', '../../styles/layout.scss']
})
export class FriendsComponent implements OnInit {

  constructor(
    public settingsService: SettingsService,
  ) { }

  ngOnInit() {
  }

}
