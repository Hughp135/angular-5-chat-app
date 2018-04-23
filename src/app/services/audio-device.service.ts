import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class AudioDeviceService {
  public inputDevices: BehaviorSubject<Array<MediaDeviceInfo>>
    = new BehaviorSubject(undefined);
  public outputDevices: BehaviorSubject<Array<MediaDeviceInfo>>
    = new BehaviorSubject(undefined);
  public selectedInputDevice: BehaviorSubject<string>
    = new BehaviorSubject(undefined);
  public selectedOutputDevice: BehaviorSubject<string>
    = new BehaviorSubject(undefined);
  public savedOutputDevice: string;
  public savedInputDevice: string;
  private noMicDetected: boolean;
  private stream: MediaStream;

  constructor() {
    this.savedInputDevice = localStorage.getItem('inputDevice');
    this.savedOutputDevice = localStorage.getItem('outputDevice');
    this.getDevices();
  }

  public async getDevices() {
    const deviceInfos = <MediaDeviceInfo[]>await navigator.mediaDevices
      .enumerateDevices()
      .catch((e: any) => {
        console.error(e);
        return;
      });
    const inputDevices = [];
    const outputDevices = [];

    for (const deviceInfo of deviceInfos) {
      if (deviceInfo.kind === 'audioinput') {
        if (this.savedInputDevice === deviceInfo.deviceId) {
          this.selectedInputDevice.next(deviceInfo.deviceId);
        }
        inputDevices.push({
          ...JSON.parse(JSON.stringify(deviceInfo)),
          label: this.getDeviceLabel(deviceInfo.label, deviceInfo.kind),
        });
      } else if (deviceInfo.kind === 'audiooutput') {
        if (this.savedOutputDevice === deviceInfo.deviceId) {
          this.selectedOutputDevice.next(deviceInfo.deviceId);
        }
        outputDevices.push({
          ...JSON.parse(JSON.stringify(deviceInfo)),
          label: this.getDeviceLabel(deviceInfo.label, deviceInfo.kind),
        });
      }
    }
    this.inputDevices.next(inputDevices);
    this.outputDevices.next(outputDevices);
  }

  private getDeviceLabel(label: string, kind: string): string {
    switch (label) {
      case 'Default':
        return 'Default Device';
      case 'Communications':
        return 'Default Communications Device';
      default:
        return label ? label : 'Unknown Device';
    }
  }
}
