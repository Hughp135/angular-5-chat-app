import { TestBed, inject } from '@angular/core/testing';

import { DirectMessageService } from './direct-message.service';

describe('DirectMessageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DirectMessageService]
    });
  });

  it('should be created', inject([DirectMessageService], (service: DirectMessageService) => {
    expect(service).toBeTruthy();
  }));
  it('should request channel id', () => {
    expect(true).toEqual(false);
  });
});
