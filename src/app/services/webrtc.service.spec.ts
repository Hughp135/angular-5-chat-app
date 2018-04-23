import { TestBed, inject } from '@angular/core/testing';

import { WebRTCService } from './webrtc.service';

describe('WebRTCService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebRTCService]
    });
  });

  it('should be created', inject([WebRTCService], (service: WebRTCService) => {
    expect(service).toBeTruthy();
  }));
});
