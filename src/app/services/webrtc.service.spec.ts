import { TestBed, inject } from '@angular/core/testing';

import { WebRTCService } from './webrtc.service';
import { WebsocketService } from './websocket.service';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from '../reducers/app.states';
import { reducers } from '../reducers/reducers';
import { AudioDeviceService } from './audio-device.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as SimplePeer from 'simple-peer';
import { JOIN_VOICE_CHANNEL, LEAVE_VOICE_CHANNEL } from '../reducers/current-voice-channel-reducer';
import { VoiceChannel } from 'shared-interfaces/voice-channel.interface';
import { SET_ME } from '../reducers/me-reducer';
import { ErrorService } from './error.service';

describe('WebRTCService', () => {
  let store: Store<AppState>;
  const signalData = new BehaviorSubject<any>(undefined);
  let service: WebRTCService;
  let getMediaDevices: jasmine.Spy;
  let audioDeviceService: AudioDeviceService;

  const fakeErrorService = {
    errorMessage: {
      next: jasmine.createSpy(),
    },
  };

  const fakeWsService = {
    socket: {
      emit: jasmine.createSpy(),
      on: (name, callback) => {
        if (name === 'signal') {
          signalData.filter(data => !!data)
            .subscribe(data => callback(data));
        }
      },
    },
    awaitNextEvent: jasmine.createSpy(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot(reducers),
      ],
      providers: [
        WebRTCService,
        { provide: WebsocketService, useValue: fakeWsService },
        AudioDeviceService,
        { provide: ErrorService, useValue: fakeErrorService },
      ],
    });
    service = TestBed.get(WebRTCService);
    store = TestBed.get(Store);
    store.dispatch({
      type: SET_ME,
      payload: {
        _id: 'meId',
      },
    });
    audioDeviceService = TestBed.get(AudioDeviceService);
    getMediaDevices = spyOn(navigator.mediaDevices, 'getUserMedia');
  });

  afterEach(() => {
    getMediaDevices.calls.reset();
    fakeErrorService.errorMessage.next.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('when receiving signal from ws, call peer.signal', () => {
    service.peers = {
      a1: { signal: jasmine.createSpy() },
    };
    signalData.next({ socketId: 'a1', signalData: 'some-data' });
    expect(service.peers.a1.signal).toHaveBeenCalledTimes(1);
    expect(service.peers.a1.signal).toHaveBeenCalledWith('some-data');
  });
  it('when joining first channel, gets media devices and sets stream', async () => {
    const newStream = new MediaStream();
    getMediaDevices.and.returnValue(newStream);
    const channel: VoiceChannel = {
      _id: '123',
      name: 'chan1',
      users: [],
    };
    store.dispatch({
      type: JOIN_VOICE_CHANNEL,
      payload: channel,
    });
    await new Promise(res => setTimeout(res, 5));
    expect(getMediaDevices).toHaveBeenCalled();
    expect(service.stream).toEqual(newStream);
  });
  it('when joining a channel, does not get media devices again if stream is set', async () => {
    const newStream = new MediaStream();
    service.stream = newStream;
    const channel: VoiceChannel = {
      _id: '123',
      name: 'chan1',
      users: [],
    };
    store.dispatch({
      type: JOIN_VOICE_CHANNEL,
      payload: channel,
    });
    await new Promise(res => setTimeout(res, 5));
    expect(getMediaDevices).not.toHaveBeenCalled();
    expect(service.stream).toEqual(newStream);
  });
  it('creates peer object for other users in new channel', async () => {
    const channel: VoiceChannel = {
      _id: '123',
      name: 'chan1',
      users: [
        { _id: 'user1id', socket_id: 'socketId1', username: 'user1' },
        { _id: 'meId', socket_id: 'socketIdMe', username: 'meUser' },
      ],
    };
    store.dispatch({
      type: JOIN_VOICE_CHANNEL,
      payload: channel,
    });
    await new Promise(res => setTimeout(res, 5));
    expect(Object.keys(service.peers).length).toEqual(1);
    expect(service.peers['socketId1']).toBeDefined();
    expect(service.peers['meId']).toBeUndefined();
  });
  it('doesnt create new peer for the same user in a new channel', async () => {
    const channel: VoiceChannel = {
      _id: '123',
      name: 'chan1',
      users: [
        { _id: 'user1id', socket_id: 'socketId1', username: 'user1' },
        { _id: 'meId', socket_id: 'socketIdMe', username: 'meUser' },
      ],
    };
    store.dispatch({
      type: JOIN_VOICE_CHANNEL,
      payload: channel,
    });
    await new Promise(res => setTimeout(res, 5));
    const peerId = service.peers['socketId1']._id;
    store.dispatch({
      type: JOIN_VOICE_CHANNEL,
      payload: { ...channel },
    });
    await new Promise(res => setTimeout(res, 5));
    expect(service.peers['socketId1']._id).toEqual(peerId);
  });
  it('leaving channel disconnects from all users', async () => {
    const channel: VoiceChannel = {
      _id: '123',
      name: 'chan1',
      users: [
        { _id: 'user1id', socket_id: 'socketId1', username: 'user1' },
        { _id: 'user2id', socket_id: 'socketId2', username: 'user2' },
        { _id: 'meId', socket_id: 'socketIdMe', username: 'meUser' },
      ],
    };
    store.dispatch({
      type: JOIN_VOICE_CHANNEL,
      payload: channel,
    });
    await new Promise(res => setTimeout(res, 5));
    expect(Object.keys(service.peers).length).toEqual(2);
    store.dispatch({
      type: LEAVE_VOICE_CHANNEL,
    });
    await new Promise(res => setTimeout(res, 5));
    expect(Object.keys(service.peers).length).toEqual(0);
  });
  it('changing input device reconnects to all users', async () => {
    const channel: VoiceChannel = {
      _id: '123',
      name: 'chan1',
      users: [
        { _id: 'user1id', socket_id: 'socketId1', username: 'user1' },
        { _id: 'user2id', socket_id: 'socketId2', username: 'user2' },
        { _id: 'meId', socket_id: 'socketIdMe', username: 'meUser' },
      ],
    };
    store.dispatch({
      type: JOIN_VOICE_CHANNEL,
      payload: channel,
    });
    await new Promise(res => setTimeout(res, 5));
    const peer1Id = service.peers['socketId1']._id;
    const peer2Id = service.peers['socketId2']._id;
    expect(Object.keys(service.peers).length).toEqual(2);
    audioDeviceService.selectedInputDevice.next('new-device');
    await new Promise(res => setTimeout(res, 5));
    expect(Object.keys(service.peers).length).toEqual(2);
    expect(service.peers['socketId1']).not.toEqual(peer1Id);
    expect(service.peers['socketId2']).not.toEqual(peer2Id);
  });
  it('changing output device sets sinkId of audio elements', async () => {
    const audio1 = document.createElement('audio');
    audio1.className = 'rtc-audio-element';
    const audio2 = document.createElement('audio');
    audio2.className = 'rtc-audio-element';
    spyOn(document, 'getElementsByClassName').and.returnValue([
      audio1, audio2,
    ]);
    expect((audio1 as any).sinkId).toEqual('');
    expect((audio2 as any).sinkId).toEqual('');
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioDevices = devices.filter(device => device.kind === 'audiooutput');
    await service.onOutputDeviceChanged(audioDevices[0].deviceId);
    expect((audio1 as any).sinkId).toEqual(audioDevices[0].deviceId);
    expect((audio2 as any).sinkId).toEqual(audioDevices[0].deviceId);
  });
  it('changing output device shows errorMessage if setSinkId throws', async () => {
    spyOn(document, 'getElementsByClassName').and.returnValue([
      {},
    ]);
    await service.onOutputDeviceChanged('badid');
    expect(fakeErrorService.errorMessage.next).toHaveBeenCalledTimes(1);
  });
});
