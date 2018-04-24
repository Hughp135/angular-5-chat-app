import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoiceChannelComponent } from './voice-channel.component';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from '../../reducers/app.states';
import { reducers } from '../../reducers/reducers';

describe('VoiceChannelComponent', () => {
  let component: VoiceChannelComponent;
  let fixture: ComponentFixture<VoiceChannelComponent>;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot(reducers),
      ],
      declarations: [VoiceChannelComponent],
      providers: [
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoiceChannelComponent);
    store = TestBed.get(Store);
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
