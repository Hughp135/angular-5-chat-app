import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers/app.states';
import { VoiceChannel } from 'shared-interfaces/voice-channel.interface';
import { Me } from 'shared-interfaces/user.interface';
import { WebRTCService } from '../../services/webrtc.service';
import { LEAVE_VOICE_CHANNEL } from '../../reducers/current-voice-channel-reducer';
import { WebsocketService } from '../../services/websocket.service';
import { SettingsService } from '../../services/settings.service';


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
    private wsService: WebsocketService,
    public webRtcService: WebRTCService,
    public settingsService: SettingsService,
  ) {
    store.select('me').subscribe(me => this.me = me);
  }

  ngOnInit() {
  }

  leaveChannel() {
    this.wsService.socket.emit('leave-voice-channel', this.currentVoiceChannel._id);
    this.store.dispatch({
      type: LEAVE_VOICE_CHANNEL,
    });
  }

  toggleMuteMicrophone() {
    this.webRtcService.toggleMuteMicrophone();
  }
}
