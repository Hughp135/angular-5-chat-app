import { Injectable } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers/app.states';
import { Me } from '../../../shared-interfaces/user.interface';
import * as SimplePeer from 'simple-peer';
import { AudioDeviceService } from './audio-device.service';
import { VoiceChannel } from '../../../shared-interfaces/voice-channel.interface';

@Injectable()
export class WebRTCService {
  private stream: any;
  private selectedInputDevice: string;
  private selectedOutputDevice: string;
  public peers: any = {};
  public noMicDetected = false;
  public currentChannel: VoiceChannel;
  public me: Me;

  constructor(
    private wsService: WebsocketService,
    private store: Store<AppState>,
    private audioDeviceService: AudioDeviceService,
  ) {
    store.select('me').subscribe(me => {
      this.me = me;
    });
    store.select('currentVoiceChannel').subscribe(channel => {
      console.log('channel changed', channel);
      const prevChannel = this.currentChannel ? { ...this.currentChannel } : null;
      this.currentChannel = channel;
      setTimeout(() => {
        this.onChannelJoined(prevChannel);
      }, 50);
    });
    // Audio device changes
    audioDeviceService.selectedInputDevice.filter(device => !!device)
      .subscribe(device => {
        this.selectedInputDevice = device;
        // this.reconnectToVoice();
      });
    audioDeviceService.selectedOutputDevice.filter(device => !!device)
      .subscribe(device => {
        this.onOutputDeviceChanged(device);
      });

    // Subscribe to signal data
    wsService.socket.on('signal', (signal) => {
      console.log('received signal');
      if (signal && this.peers && this.peers[signal.socketId]) {
        const peer = this.peers[signal.socketId];
        peer.signal(signal.signalData);
      }
    });
  }

  async onChannelJoined(prevChannel: VoiceChannel) {
    if (prevChannel) {
      console.error('disconnectPlayers not implemented yet');
      // this.disconnectPlayers(prevChannel, currentChannel);
    }

    if (!this.currentChannel) {
      return;
    }

    console.log(prevChannel, this.currentChannel);
    // Check if channel id changed since previous
    if (!prevChannel || prevChannel._id !== this.currentChannel._id) {
      if (!this.stream) {
        try {
          console.error('awaiting media stream');
          await this.addMediaStream();
        } catch (e) {
          console.error('unable to get stream', e);
        }
      }
      console.error('connecting');
      // new joiners don't initiate
      this.connectToVoice(false);
    } else {
      // existing users in squad send the first signal
      this.connectToVoice(true);
    }
  }

  reconnectToVoice() {
    console.warn('reconnecting to voice');
    // Destroy all peer connections
    let peerCount = 0;
    for (const peer in this.peers) {
      if (this.peers.hasOwnProperty(peer)) {
        ++peerCount;
        this.peers[peer].send('destroy-connection');
        this.peers[peer].destroy();
        delete this.peers[peer];
      }
    }
    if (peerCount > 0) {
      // Add stream & reconnect to peers
      this.addMediaStream();
      setTimeout(() => {
        this.connectToVoice(true);
      }, 100);
    }
  }

  addMediaStream() {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices
        .getUserMedia({
          video: false,
          audio: {
            deviceId: this.selectedInputDevice
              ? { exact: this.selectedInputDevice }
              : undefined,
          },
        })
        .then(stream => {
          this.noMicDetected = false;
          this.stream = stream;
          console.warn('got stream', stream);
          resolve();
        })
        .catch(err => {
          this.noMicDetected = true;
          console.error('Unable to get user media', err);
          reject();
        });
    });
  }

  connectToVoice(initiator: boolean) {
    console.warn('is initatior?', initiator);
    const wsService = this.wsService;

    if (!this.currentChannel) {
      return;
    }
    const users = this.currentChannel.users.filter((item: any) => {
      return item._id !== this.me._id;
    });
    for (const user of users) {
      const existingPeer = this.peers[user.socket_id];
      if (existingPeer) {
        if (existingPeer.connected) {
          console.warn('Peer already connected, not reconnecting', existingPeer);
          continue;
        }
      }
      // TODO: idea to trickle - collect all signal events, emit once per second.
      const p = new SimplePeer({
        initiator: initiator,
        trickle: true,
        stream: this.stream,
        constraints: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: false,
        },
        reconnectTimer: 1000,
      });
      const self = this;
      console.warn('Initial peer', p);
      this.peers[user.socket_id] = p;
      p.on('error', function (err) {
        console.warn('error', err, p);
      });
      p.on('signal', function (data: any) {
        wsService.socket.emit('signal', {
          socketId: user.socket_id,
          signalData: data,
        });
      });
      p.on('data', function (data) {
        const msg = data.toString();
        if (msg === 'destroy-connection') {
          console.warn('Received request to destroy connection');
          delete self.peers[user._id];
          setTimeout(() => {
            self.connectToVoice(false);
          }, 100);
          p.destroy();
        }
      });
      p.on('connect', function () {
        console.warn('CONNECT users', users);
        p.send('whatever' + Math.random());
      });
      p.on('disconnect', function () {
        console.warn('Peer disconnected', user._id);
      });
      p.on('destroy', function () {
        console.warn('Peer destroyed', user._id);
      });
      p.on('stream', function (stream: any) {
        console.warn('got peer stream', stream);
        console.log('finding element', 'userAudio-' + user._id);
        const element = <HTMLMediaElement>document.getElementById(
          'userAudio-' + user._id,
        );
        element.srcObject = stream;
        if (self.selectedOutputDevice) {
          self.setSinkId(element, self.selectedOutputDevice);
        }
        element.play();
      });
    }
  }

  onOutputDeviceChanged(device) {
    this.selectedOutputDevice = device;
    const elements = <any>document.getElementsByClassName(
      'rtc-audio-element',
    );
    try {
      for (const element of elements) {
        this.setSinkId(element, device);
      }
    } catch (error) {
      let errorMessage = error;
      if (error.name === 'SecurityError') {
        errorMessage =
          'You need to use HTTPS for selecting audio output ' +
          'device: ' +
          error;
      }
      console.error(errorMessage);
    }
  }

  setSinkId(element: any, id: string) {
    if (typeof element.sinkId !== 'undefined') {
      element.setSinkId(id);
    } else {
      console.warn('Browser does not support output device selection.');
    }
  }
}
