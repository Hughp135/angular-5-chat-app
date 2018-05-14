import { Injectable } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers/app.states';
import { Me } from '../../../shared-interfaces/user.interface';
import * as SimplePeer from 'simple-peer';
import { AudioDeviceService } from './audio-device.service';
import { VoiceChannel } from '../../../shared-interfaces/voice-channel.interface';
import { ErrorService, ErrorNotification } from './error.service';

@Injectable()
export class WebRTCService {
  private selectedInputDevice: string;
  private selectedOutputDevice: string;
  public stream: MediaStream;
  public peers: any = {};
  public noMicDetected = false;
  public currentChannel: VoiceChannel;
  public me: Me;
  public micMuted = false;

  constructor(
    private wsService: WebsocketService,
    store: Store<AppState>,
    public audioDeviceService: AudioDeviceService,
    private errorService: ErrorService,
  ) {
    store.select('me').subscribe(me => {
      this.me = me;
    });
    store.select('currentVoiceChannel').subscribe(channel => {
      console.warn('channel changed', channel);
      const prevChannel = this.currentChannel ? { ...this.currentChannel } : null;
      this.currentChannel = channel;
      this.onChannelJoined(prevChannel);
    });
    // Audio device changes
    audioDeviceService.selectedInputDevice.filter(device => !!device)
      .subscribe(async device => {
        this.selectedInputDevice = device;
        await this.addMediaStream();
        this.reconnectToAllPeers();
      });
    audioDeviceService.selectedOutputDevice.filter(device => !!device)
      .subscribe(async device => {
        await this.onOutputDeviceChanged(device);
      });

    // Subscribe to signal data
    wsService.socket.on('signal', (signal) => {
      console.warn('got signal');
      if (signal && this.peers && this.peers[signal.socketId]) {
        const peer = this.peers[signal.socketId];
        peer.signal(signal.signalData);
      }
    });
  }

  async onChannelJoined(prevChannel: VoiceChannel) {
    const currentUsers = this.currentChannel ? this.currentChannel.users : [];
    const previousUsers = prevChannel ? prevChannel.users : [];

    if (this.currentChannel && !this.stream) {
      try {
        console.error('awaiting media stream');
        await this.addMediaStream();
      } catch (e) {
        this.noMicDetected = true;
        console.error('unable to get stream', e);
      }
    }

    const usersJoined = currentUsers.filter((curUser) =>
      curUser._id !== this.me._id &&
      // None of previous state users are in current state
      !previousUsers.some(prevUser => prevUser.socket_id === curUser.socket_id),
    );
    const usersLeft = previousUsers.filter((prevUser) =>
      prevUser._id !== this.me._id &&
      // None of the current users were in previous state
      !currentUsers.some(currUser => currUser.socket_id === prevUser.socket_id),
    );
    const isNewChannel = !prevChannel
      || (this.currentChannel && this.currentChannel._id !== prevChannel._id);

    usersLeft.forEach(usr => this.disconnectFromUser(usr.socket_id));
    usersJoined.forEach(usr => this.connectToUser(usr.socket_id, !isNewChannel));
  }

  async addMediaStream() {
    try {
      const stream = await navigator.mediaDevices
        .getUserMedia({
          video: false,
          audio: {
            deviceId: this.selectedInputDevice
              ? { exact: this.selectedInputDevice }
              : undefined,
          },
        });
      this.noMicDetected = false;
      this.stream = stream;
      this.micMuted = false;
    } catch (err) {
      this.noMicDetected = true;
      throw (err);
    }
  }

  connectToUser(socket_id: string, isInitiator: boolean) {
    console.warn('Connecting to user ' + socket_id, 'intiator?', isInitiator, 'stream:', this.stream);
    // TODO: idea to trickle - collect all signal events, emit once per second.
    const p = new SimplePeer({
      initiator: isInitiator,
      trickle: true,
      stream: this.stream,
      constraints: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: false,
      },
      reconnectTimer: 1000,
    });
    const self = this;
    this.peers[socket_id] = p;
    p.on('error', function (err) {
      console.warn('error', err, p);
    });
    p.on('signal', function (data: any) {
      self.wsService.socket.emit('signal', {
        socketId: socket_id,
        signalData: data,
      });
    });
    p.on('data', function (data) {
      const msg = data.toString();
      if (msg === 'destroy-connection') {
        setTimeout(() => {
          self.connectToUser(socket_id, false);
        }, 100);
        self.disconnectFromUser(socket_id);
      }
    });
    p.on('connect', function () {
      console.warn('CONNECTED TO USER', socket_id);
      p.send('whatever' + Math.random());
    });
    p.on('disconnect', function () {
      console.warn('Peer disconnected', socket_id);
    });
    p.on('destroy', function () {
      console.warn('Peer destroyed', socket_id);
    });
    p.on('stream', function (stream: any) {
      console.warn('got peer stream', stream);
      const element = <HTMLMediaElement>document.getElementById(
        'userAudio-' + socket_id,
      );
      element.srcObject = stream;
      if (self.selectedOutputDevice) {
        self.setSinkId(element, self.selectedOutputDevice);
      }
      element.play();
    });
  }

  disconnectFromUser(socket_id: string) {
    console.warn('Disconnecting from user ' + socket_id);
    if (this.peers && this.peers[socket_id]) {
      this.peers[socket_id].destroy();
      delete this.peers[socket_id];
    }
  }

  reconnectToAllPeers() {
    console.warn('reconnecting to voice');
    // Destroy all peer connections
    const socketIds = Object.keys(this.peers);

    socketIds.forEach(socket_id => {
      if (this.peers[socket_id].connected) {
        console.error('Destroying connection');
        this.peers[socket_id].send('destroy-connection');
      }
      this.peers[socket_id].destroy();
      delete this.peers[socket_id];
      this.connectToUser(socket_id, true);
    });
  }

  async onOutputDeviceChanged(device) {
    this.selectedOutputDevice = device;
    const elements = <any>document.getElementsByClassName(
      'rtc-audio-element',
    );
    try {
      for (const element of elements) {
        await this.setSinkId(element, device);
      }
    } catch (error) {
      this.errorService.errorMessage.next(
        new ErrorNotification(
          'Your browser does not support output device selection.',
          5000,
        ),
      );
      console.error(error);
    }
  }

  async setSinkId(element: any, id: string) {
    if (typeof element.sinkId === 'undefined') {
      throw new Error('Browser does not support sinkId');
    }
    await element.setSinkId(id);
  }


  public toggleMuteMicrophone() {
    if (!this.stream) {
      this.micMuted = true;
      return;
    }
    const track = this.stream.getAudioTracks()[0];
    track.enabled = !track.enabled;
    this.micMuted = !track.enabled;
  }
}
