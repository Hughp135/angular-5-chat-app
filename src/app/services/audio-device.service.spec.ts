import { TestBed } from '@angular/core/testing';

import { AudioDeviceService } from './audio-device.service';

describe('AudioDeviceService', () => {
  let service: AudioDeviceService;
  let enumerateDevicesSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AudioDeviceService],
    });
    service = TestBed.get(AudioDeviceService);
  });

  afterEach(() => {
    (<jasmine.Spy>enumerateDevicesSpy).calls.reset();
  });

  describe('when no devices are found', () => {
    beforeAll(() => {
      enumerateDevicesSpy = spyOn(navigator.mediaDevices, 'enumerateDevices')
        .and.returnValue([]);
    });
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
    it('input/output devices should be empty', async () => {
      await awaitLoadedDevices(service);
      expect(service.inputDevices.getValue()).toEqual([]);
      expect(service.outputDevices.getValue()).toEqual([]);
    });
  });
  describe('when audioinput and audiooutput devices are found', () => {
    beforeAll(() => {
      enumerateDevicesSpy = spyOn(navigator.mediaDevices, 'enumerateDevices')
        .and.returnValue([
          { kind: 'audioinput', label: 'device1', deviceId: '1' },
          { kind: 'audioinput', label: 'device2', deviceId: '2' },
          { kind: 'audiooutput', label: 'device3', deviceId: '3' },
          { kind: 'audiooutput', label: 'device4', deviceId: '4' },
          { kind: 'irrelevant', label: 'device5', deviceId: '5' },
        ]);
    });
    it('input/output devices should be set to correct devices', async () => {
      await awaitLoadedDevices(service);
      expect(service.inputDevices.getValue()).toEqual(<any>[
        { kind: 'audioinput', label: 'device1', deviceId: '1' },
        { kind: 'audioinput', label: 'device2', deviceId: '2' },
      ]);
      expect(service.outputDevices.getValue()).toEqual(<any>[
        { kind: 'audiooutput', label: 'device3', deviceId: '3' },
        { kind: 'audiooutput', label: 'device4', deviceId: '4' },
      ]);
    });
  });
  describe('when device labels should be converted', () => {
    beforeAll(() => {
      enumerateDevicesSpy = spyOn(navigator.mediaDevices, 'enumerateDevices')
        .and.returnValue([
          { kind: 'audioinput', label: 'Default', deviceId: '1' },
          { kind: 'audioinput', label: 'Communications', deviceId: '2' },
          { kind: 'audiooutput', label: null, deviceId: '3' },
        ]);
    });
    it('input/output device labels are converted to more descriptive values', async () => {
      await awaitLoadedDevices(service);
      expect(service.inputDevices.getValue()).toEqual(<any>[
        { kind: 'audioinput', label: 'Default Device', deviceId: '1' },
        { kind: 'audioinput', label: 'Default Communications Device', deviceId: '2' },
      ]);
      expect(service.outputDevices.getValue()).toEqual(<any>[
        { kind: 'audiooutput', label: 'Unknown Device', deviceId: '3' },
      ]);
    });
  });
  describe('saved input / output devices are found', () => {
    beforeAll(() => {
      enumerateDevicesSpy = spyOn(navigator.mediaDevices, 'enumerateDevices')
        .and.returnValue([
          { kind: 'audioinput', label: 'device1', deviceId: '123' },
          { kind: 'audiooutput', label: 'device2', deviceId: '345' },
        ]);
    });
    beforeEach(() => {
      service.savedInputDevice = '123';
      service.savedOutputDevice = '345';
    });
    it('sets saved input device as selected', async () => {
      await awaitLoadedDevices(service);
      expect(service.selectedInputDevice.getValue()).toEqual('123');
    });
    it('sets saved output device as selected', async () => {
      await awaitLoadedDevices(service);
      expect(service.selectedOutputDevice.getValue()).toEqual('345');
    });
  });
  describe('saved input / output devices are not found', () => {
    beforeAll(() => {
      enumerateDevicesSpy = spyOn(navigator.mediaDevices, 'enumerateDevices')
        .and.returnValue([
          { kind: 'audioinput', label: 'device1', deviceId: 'notfound1' },
          { kind: 'audiooutput', label: 'device2', deviceId: 'notfound2' },
        ]);
    });
    beforeEach(() => {
      service.savedInputDevice = '123';
      service.savedOutputDevice = '345';
    });
    it('does not select input device', async () => {
      await awaitLoadedDevices(service);
      expect(service.selectedInputDevice.getValue()).toEqual(undefined);
    });
    it('does not select output device', async () => {
      await awaitLoadedDevices(service);
      expect(service.selectedOutputDevice.getValue()).toEqual(undefined);
    });
  });
});

function awaitLoadedDevices(service) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (service.loadedDevices) {
        clearInterval(interval);
        resolve();
      }
    }, 2);
    setTimeout(() => {
      clearInterval(interval);
      reject('Devices failed to load within timeout');
    }, 200);
  });
}
