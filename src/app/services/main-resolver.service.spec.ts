import { TestBed, inject } from '@angular/core/testing';

import { MainResolver } from './main-resolver.service';

describe('MainResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MainResolver]
    });
  });

  it('should be created', inject([MainResolver], (service: MainResolver) => {
    expect(service).toBeTruthy();
  }));
});
