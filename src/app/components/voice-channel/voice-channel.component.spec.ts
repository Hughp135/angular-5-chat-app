import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoiceChannelComponent } from './voice-channel.component';
import { StoreModule } from '@ngrx/store';
import { reducers } from '../../reducers/reducers';
import { WebRTCService } from '../../services/webrtc.service';

describe('VoiceChannelComponent', () => {
  let component: VoiceChannelComponent;
  let fixture: ComponentFixture<VoiceChannelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot(reducers),
      ],
      declarations: [VoiceChannelComponent],
      providers: [
        { provide: WebRTCService, useValue: {} },
      ],
    })
      .compileComponents();
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
});
