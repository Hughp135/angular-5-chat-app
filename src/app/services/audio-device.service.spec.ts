import { TestBed, inject } from '@angular/core/testing';

import { AudioDeviceService } from './audio-device.service';

describe('AudioDeviceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AudioDeviceService],
    });
  });

  it('should be created', inject([AudioDeviceService], (service: AudioDeviceService) => {
    expect(service).toBeTruthy();
  }));
});
