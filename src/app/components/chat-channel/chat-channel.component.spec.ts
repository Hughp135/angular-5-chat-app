import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';

import { ChatChannelComponent } from './chat-channel.component';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';

describe('ChatChannelComponent', () => {
  let component: ChatChannelComponent;
  let fixture: ComponentFixture<ChatChannelComponent>;
  let injector: TestBed;
  let appState: AppStateService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatChannelComponent ],
      imports: [ FormsModule ],
      providers: [ AppStateService ],
    })
    .compileComponents();
    injector = getTestBed();
    appState = injector.get(AppStateService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should get current channel', () => {
    const chan = {
      name: 'name',
      _id: '123',
      server_id: '345',
    };
    appState.currentChatChannel = chan;
    expect(component.currentChannel).toEqual(chan);
  });
});
