import { TestBed, getTestBed } from '@angular/core/testing';

import { AppStateService } from './app-state.service';
import { ChannelList } from '../../../shared-interfaces/channel.interface';

const channelList: ChannelList = {
  server_id: '123',
  channels: [
    {
      name: 'channel1',
      server_id: '123',
    },
  ]
};

describe('AppStateService', () => {
  let injector: TestBed;
  let service: AppStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppStateService]
    });
    injector = getTestBed();
    service = injector.get(AppStateService);
  });

  it('initial state', () => {
    expect(service).toBeTruthy();
    expect(service.currentServer).toBeUndefined();
  });
  it('updates channel list if server ID matches', () => {
    service.currentServer = {
      name: 'whocares',
      _id: '123',
      owner_id: 'notrelevant'
    };
    service.updateChannelsList(channelList);
    expect(service.currentServer.channelList).toEqual(channelList.channels);
  });
  it('does not update channel list if server ID doesn\'t match', () => {
    service.currentServer = {
      name: 'whocares',
      _id: 'abc',
      owner_id: 'notrelevant'
    };
    service.updateChannelsList(channelList);
    expect(service.currentServer.channelList).toBeUndefined();
  });
});
