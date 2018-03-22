import { TestBed } from '@angular/core/testing';

import { ChannelSettingsService } from './channel-settings.service';
import { StoreModule, Store } from '@ngrx/store';
import { AppState } from '../reducers/app.states';
import { reducers } from '../reducers/reducers';
import { JOIN_CHANNEL } from '../reducers/current-chat-channel.reducer';
import { ChatChannel } from '../../../shared-interfaces/channel.interface';

function getService(): { service: ChannelSettingsService, store: Store<AppState> } {
  TestBed.configureTestingModule({
    providers: [
      ChannelSettingsService,
    ],
    imports: [
      StoreModule.forRoot(reducers),
    ],
  });
  const store = TestBed.get(Store);
  return {
    service: TestBed.get(ChannelSettingsService),
    store: store,
  };
}

describe('ChannelSettingsService', () => {

  beforeEach(() => {
    localStorage.removeItem('channelsVisited');
    jasmine.clock().install();
  });
  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should be created', () => {
    const service = getService();
    expect(service).toBeTruthy();
  });
  it('should be created', () => {
    const { service } = getService();
    expect(service).toBeTruthy();
  });
  it('channelsVisited is set to empty object if no value is saved', () => {
    const { service } = getService();
    expect(service.channelsVisited).toEqual({});
  });
  it('channelsVisited is loaded from localStorage if set', () => {
    const date = new Date();
    const time = date.getTime();
    localStorage.setItem('channelsVisited', JSON.stringify({ asd: date }));
    const { service } = getService();
    const savedDate = service.channelsVisited.asd;
    expect(savedDate).toBeDefined();
    expect(new Date(savedDate).getTime()).toBeGreaterThan(0);
    expect(time - new Date(savedDate).getTime()).toBeLessThan(5); // within 5 ms
  });
  it('channelsVisited updates with correct data when changing channel', () => {
    const { service, store } = getService();
    expect(service.channelsVisited).toEqual({});
    const channel: ChatChannel = {
      _id: '123',
      name: 'chan1',
    };
    const channel2: ChatChannel = {
      _id: '345',
      name: 'chan2',
    };
    store.dispatch({
      type: JOIN_CHANNEL,
      payload: channel,
    });
    jasmine.clock().tick(1000);
    expect(service.channelsVisited[channel._id]).toBeDefined();

    const date = new Date();

    expect(service.channelsVisited[channel._id]).toBeDefined();
    expect(service.channelsVisited[channel._id].getFullYear()).toEqual(date.getFullYear());
    expect(service.channelsVisited[channel._id].getMonth()).toEqual(date.getMonth());
    expect(service.channelsVisited[channel._id].getDate()).toEqual(date.getDate());
    expect(service.channelsVisited[channel._id].getHours()).toEqual(date.getHours());

    store.dispatch({
      type: JOIN_CHANNEL,
      payload: channel2,
    });
    jasmine.clock().tick(1000);
    const date2 = new Date();
    expect(service.channelsVisited[channel._id]).toBeDefined();
    expect(service.channelsVisited[channel._id].getFullYear()).toEqual(date2.getFullYear());
    expect(service.channelsVisited[channel2._id]).toBeDefined();
    expect(service.channelsVisited[channel2._id].getFullYear()).toEqual(date2.getFullYear());
    expect(service.channelsVisited[channel2._id].getMonth()).toEqual(date2.getMonth());
    expect(service.channelsVisited[channel2._id].getDate()).toEqual(date2.getDate());
    expect(service.channelsVisited[channel2._id].getHours()).toEqual(date2.getHours());

    store.dispatch({
      type: JOIN_CHANNEL,
      payload: undefined,
    });
    jasmine.clock().tick(1000);
    expect(service.channelsVisited[channel._id]).toBeDefined();
    expect(service.channelsVisited[channel2._id]).toBeDefined();
  });
  it('Saves channelsVisited to localstorage', () => {
    const { service, store } = getService();
    const channel: ChatChannel = {
      _id: '123',
      name: 'chan1',
    };
    store.dispatch({
      type: JOIN_CHANNEL,
      payload: channel,
    });
    jasmine.clock().tick(1000);
    expect(service.channelsVisited[channel._id]).toBeDefined();
    const savedValue = JSON.parse(localStorage.getItem('channelsVisited'));
    expect(savedValue[channel._id]).toBeDefined();
  });
});
