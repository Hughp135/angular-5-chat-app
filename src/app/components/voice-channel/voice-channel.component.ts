import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers/app.states';
import { VoiceChannel } from 'shared-interfaces/voice-channel.interface';
import { Me } from 'shared-interfaces/user.interface';
import { WebRTCService } from '../../services/webrtc.service';


@Component({
  selector: 'app-voice-channel',
  templateUrl: './voice-channel.component.html',
  styleUrls: ['./voice-channel.component.scss'],
})
export class VoiceChannelComponent implements OnInit {
  public me: Me;

  @Input() currentVoiceChannel: VoiceChannel;

  constructor(
    store: Store<AppState>,
    webRtcService: WebRTCService,
  ) {
    store.select('me').subscribe(me => this.me = me);
  }

  ngOnInit() {
  }
}
