import { TestBed } from '@angular/core/testing';

import { WebRTCService } from './webrtc.service';
import { WebsocketService } from './websocket.service';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from '../reducers/app.states';
import { reducers } from '../reducers/reducers';
import { AudioDeviceService } from './audio-device.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { JOIN_VOICE_CHANNEL, LEAVE_VOICE_CHANNEL } from '../reducers/current-voice-channel-reducer';
import { VoiceChannel } from 'shared-interfaces/voice-channel.interface';
import { SET_ME } from '../reducers/me-reducer';
import { ErrorService } from './error.service';
import * as SimplePeer from 'simple-peer';

describe('WebRTCService', () => {
  let store: Store<AppState>;
  const signalData = new BehaviorSubject<any>(undefined);
  let service: WebRTCService;
  let mediaDevicesSpy: jasmine.Spy;
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
    mediaDevicesSpy = spyOn(navigator.mediaDevices, 'getUserMedia');
  });

  afterEach(() => {
    mediaDevicesSpy.calls.reset();
    fakeErrorService.errorMessage.next.calls.reset();
    service = null;
    audioDeviceService = null;
    mediaDevicesSpy = null;
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
    mediaDevicesSpy.and.returnValue(newStream);
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
    expect(mediaDevicesSpy).toHaveBeenCalled();
    expect(service.stream).toEqual(newStream);
  });
  it('when joining first channel if getMediaDevices throws, sets noMicDetected true', async () => {
    mediaDevicesSpy.and.throwError('test error');
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
    expect(mediaDevicesSpy).toHaveBeenCalled();
    expect(service.stream).toEqual(undefined);
    expect(service.noMicDetected).toEqual(true);
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
    expect(mediaDevicesSpy).not.toHaveBeenCalled();
    expect(service.stream).toEqual(newStream);
  });
  it('joining channel creates peer object for other users in new channel', async () => {
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
  it('joining 2nd channel doesnt create new peer for the same user', async () => {
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
  it('when joining a new channel, user peer is not iniator', async () => {
    const channel: VoiceChannel = {
      _id: '123', name: 'chan1',
      users: [{ _id: 'user1id', socket_id: 'socketId1', username: 'user1' }],
    };
    store.dispatch({ type: JOIN_VOICE_CHANNEL, payload: channel });
    await new Promise(res => setTimeout(res, 5));
    expect(Object.keys(service.peers).length).toEqual(1);
    const peer: any = service.peers['socketId1'];
    expect(peer).toBeDefined();
    expect(peer.initiator).toEqual(false);
  });
  it('on peer message destroy-connection, destroys the peer', async () => {
    const channel: VoiceChannel = {
      _id: '123', name: 'chan1',
      users: [{ _id: 'user1id', socket_id: 'socketId1', username: 'user1' }],
    };
    store.dispatch({ type: JOIN_VOICE_CHANNEL, payload: channel });
    await new Promise(res => setTimeout(res, 5));

    const peer1 = service.peers['socketId1'];

    expect(peer1).toBeDefined();
    expect((peer1 as any).initiator).toEqual(false);

    const peer2 = new SimplePeer({ initiator: true });
    peer1.on('signal', (data) => peer2.signal(data));
    peer2.on('signal', (data) => peer1.signal(data));
    await awaitPeerConnection(peer1).catch((e) => { throw (e); }); // Wait for peers to connect
    expect(peer1.connected).toEqual(true, 'assert1');

    await peer2.send('destroy-connection');
    await new Promise(res => setTimeout(res, 20)); // wait for message to send

    expect(service.peers['socketId1']).toBeUndefined();
  });
  it('after reconnecting, peer should be connected', async () => {
    // Create a peer object
    service.connectToUser('socketId', false);
    await new Promise(res => setTimeout(res, 5));
    const peer = service.peers['socketId'];
    expect(peer).toBeDefined();

    // Create a test peer to connect to
    const testPeer = new SimplePeer({ initiator: true });
    peer.on('signal', (data) => testPeer.signal(data));
    testPeer.on('signal', (data) => peer.signal(data));
    await awaitPeerConnection(peer).catch((e) => { throw new Error('peerconnect1'); });

    // Reconnect. New peer should be created as initiator
    service.reconnectToAllPeers();
    // await new Promise(res => setTimeout(res, 50));
    const peerNew = service.peers['socketId'];
    expect(peerNew._id).not.toEqual(peer._id);
    expect(peerNew.initiator).toEqual(true);

    // Create a 2nd test peer to reconnect to
    const testPeer2 = new SimplePeer({ initiator: false });
    peerNew.on('signal', (data) => testPeer2.signal(data));
    testPeer2.on('signal', (data) => peerNew.signal(data));
    await awaitPeerConnection(peerNew).catch((e) => { throw new Error('peerconnect2'); });
    expect(peerNew.connected).toEqual(true);
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
  it('reconnecting to peer sends "destroy-connection" if peer connected', async () => {
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
    const peer1Id = service.peers['socketId1']._id;
    service.peers['socketId1'].connected = true;
    const sendSpy = jasmine.createSpy();
    service.peers['socketId1'].send = sendSpy;
    audioDeviceService.selectedInputDevice.next('new-device');
    await new Promise(res => setTimeout(res, 5));
    expect(service.peers['socketId1']).not.toEqual(peer1Id);
    expect(sendSpy).toHaveBeenCalledWith('destroy-connection');
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
    service.audioDeviceService.selectedOutputDevice.next(audioDevices[0].deviceId);
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

function awaitPeerConnection(peer) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (peer.connected) {
        clearInterval(interval);
        resolve();
      }
    }, 25);
    setTimeout(() => {
      reject('Peer failed to connect within the test timeout');
    }, 4000);
  });
}
