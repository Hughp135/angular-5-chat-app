import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers/app.states';
import { VoiceChannel } from 'shared-interfaces/voice-channel.interface';
import { Me } from 'shared-interfaces/user.interface';


@Component({
  selector: 'app-voice-channel',
  templateUrl: './voice-channel.component.html',
  styleUrls: ['./voice-channel.component.scss'],
})
export class VoiceChannelComponent implements OnInit {
  public me: Me;

  @Input() currentVoiceChannel: VoiceChannel;

  constructor(
    private store: Store<AppState>,
  ) {
    store.select('me').subscribe(me => this.me = me);
  }

  ngOnInit() {
  }
}
