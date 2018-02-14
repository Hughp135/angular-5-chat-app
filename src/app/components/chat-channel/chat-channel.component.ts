import { Component, OnInit } from '@angular/core';
import { AppStateService } from '../../services/app-state.service';
import { Channel } from 'shared-interfaces/channel.interface';

@Component({
  selector: 'app-chat-channel',
  templateUrl: './chat-channel.component.html',
  styleUrls: ['./chat-channel.component.scss']
})
export class ChatChannelComponent implements OnInit {

  constructor(public appState: AppStateService) {
  }

  ngOnInit() {
  }

}
