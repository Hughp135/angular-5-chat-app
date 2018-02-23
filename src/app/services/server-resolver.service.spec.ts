import { TestBed, inject } from '@angular/core/testing';

import { ServerResolver } from './server-resolver.service';

describe('ServerResolver.Service.TsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ServerResolver]
    });
  });

  it('should be created', inject([ServerResolver], (service: ServerResolver) => {
    expect(service).toBeTruthy();
  }));
});
