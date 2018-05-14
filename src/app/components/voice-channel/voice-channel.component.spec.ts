import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoiceChannelComponent } from './voice-channel.component';
import { StoreModule } from '@ngrx/store';
import { reducers } from '../../reducers/reducers';
import { WebRTCService } from '../../services/webrtc.service';
import { WebsocketService } from '../../services/websocket.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers/app.states';
import { LEAVE_VOICE_CHANNEL } from '../../reducers/current-voice-channel-reducer';
import { SettingsService } from '../../services/settings.service';

describe('VoiceChannelComponent', () => {
  let component: VoiceChannelComponent;
  let fixture: ComponentFixture<VoiceChannelComponent>;
  let store: Store<AppState>;

  const fakeWsService = {
    socket: {
      emit: jasmine.createSpy(),
    },
  };
  const fakeWebRtcService = {
    toggleMuteMicrophone: () => { },
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot(reducers),
      ],
      declarations: [VoiceChannelComponent],
      providers: [
        { provide: WebRTCService, useValue: fakeWebRtcService },
        { provide: WebsocketService, useValue: fakeWsService },
        SettingsService,
      ],
    })
      .compileComponents();
    store = TestBed.get(Store);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoiceChannelComponent);
    component = fixture.componentInstance;
    component.currentVoiceChannel = {
      _id: '123',
      name: 'voiceChan',
      users: [],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should leave channel', () => {
    spyOn(store, 'dispatch');
    component.currentVoiceChannel = <any>{ _id: 'chan1' };
    component.leaveChannel();
    expect(fakeWsService.socket.emit).toHaveBeenCalledWith('leave-voice-channel', 'chan1');
    expect(store.dispatch).toHaveBeenCalledWith({
      type: LEAVE_VOICE_CHANNEL,
    });
  });
  it('should toggle mute mic and not throw', () => {
    component.toggleMuteMicrophone();
  });
});
