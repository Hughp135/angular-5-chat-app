import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class AudioDeviceService {
  public loadedDevices = false;
  public inputDevices: BehaviorSubject<Array<MediaDeviceInfo>> = new BehaviorSubject(
    undefined,
  );
  public outputDevices: BehaviorSubject<Array<MediaDeviceInfo>> = new BehaviorSubject(
    undefined,
  );
  public selectedInputDevice: BehaviorSubject<string> = new BehaviorSubject(undefined);
  public selectedOutputDevice: BehaviorSubject<string> = new BehaviorSubject(undefined);
  public savedOutputDevice: string;
  public savedInputDevice: string;

  constructor() {
    this.savedInputDevice = localStorage.getItem('inputDevice');
    this.savedOutputDevice = localStorage.getItem('outputDevice');
    this.getDevices();
  }

  async getDevices() {
    const devices = <MediaDeviceInfo[]>await navigator.mediaDevices.enumerateDevices();

    const inputDevices = devices
      .filter(device => device.kind === 'audioinput')
      .map(device => ({
        ...JSON.parse(JSON.stringify(device)),
        label: this.getDeviceLabel(device.label, device.kind),
      }));

    const outputDevices = devices
      .filter(device => device.kind === 'audiooutput')
      .map(device => ({
        ...JSON.parse(JSON.stringify(device)),
        label: this.getDeviceLabel(device.label, device.kind),
      }));

    this.inputDevices.next(inputDevices);
    this.outputDevices.next(outputDevices);

    const inputDeviceSaved = inputDevices.find(
      device => device.deviceId === this.savedInputDevice,
    );
    if (inputDeviceSaved) {
      this.selectedInputDevice.next(inputDeviceSaved.deviceId);
    }

    const outputDeviceSaved = outputDevices.find(
      device => device.deviceId === this.savedOutputDevice,
    );
    if (outputDeviceSaved) {
      this.selectedOutputDevice.next(outputDeviceSaved.deviceId);
    }

    this.loadedDevices = true;
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
