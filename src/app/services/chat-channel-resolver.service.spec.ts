import { TestBed, inject } from '@angular/core/testing';

import { ChatChannelResolver } from './chat-channel-resolver.service';

describe('ChatChannelResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChatChannelResolver]
    });
  });

  it('should be created', inject([ChatChannelResolver], (service: ChatChannelResolver) => {
    expect(service).toBeTruthy();
  }));
});
