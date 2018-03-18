import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { DmchannelListComponent } from './dmchannel-list.component';
import { ChatChannel, ChannelListItem } from 'shared-interfaces/channel.interface';
import ChatServer from 'shared-interfaces/server.interface';
import { SettingsService } from '../../../services/settings.service';

describe('DmchannelListComponent', () => {
  let component: DmchannelListComponent;
  let fixture: ComponentFixture<DmchannelListComponent>;
  let router: Router;

  const channel: ChatChannel = {
    name: 'name',
    _id: '123',
    server_id: '345',
    user_ids: ['123', '345'],
  };

  const server: ChatServer = {
    name: 'Friendserver test',
    _id: 'friends',
    channelList: {
      server_id: 'friends',
      users: {
        '345': { username: 'user345' },
      },
      channels: [{ name: channel.name, _id: channel._id, server_id: channel.server_id }],
    },
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DmchannelListComponent],
      imports: [
        RouterTestingModule,
      ],
      providers: [
        SettingsService,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DmchannelListComponent);
    component = fixture.componentInstance;
    component.currentChatChannel = channel;
    component.currentServer = server;
    router = TestBed.get(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('join server should redirect', () => {
    component.joinChannel(channel);
    expect(router.navigate)
      .toHaveBeenCalledWith([`friends/${channel._id}`]);
  });

  it('getChannelName returns correct channel name', () => {
    expect(component.getChannelName(channel)).toEqual('user345');
  });
  it('getChannelName returns unknown if user id not found', () => {
    const channel1 = {
      ...channel,
      user_ids: ['asd', 'bcd'],
    };
    expect(component.getChannelName(channel1)).toEqual('Unknown');
  });
});
