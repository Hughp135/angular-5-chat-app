import { TestBed, inject } from '@angular/core/testing';

import { DirectMessageService } from './direct-message.service';
import { WebsocketService } from './websocket.service';
import { ErrorService } from './error.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

describe('DirectMessageService', () => {
  let service: DirectMessageService;
  let router: Router;
  let fakeWsService;
  let fakeErrorService;

  beforeEach(() => {
    fakeWsService = {
      socket: {
        emit: jasmine.createSpy()
      },
      awaitNextEvent: jasmine.createSpy(),
    };
    fakeErrorService = {
      errorMessage: {
        next: jasmine.createSpy()
      }
    };
    TestBed.configureTestingModule({
      providers: [
        DirectMessageService,
        { provide: WebsocketService, useValue: fakeWsService },
        { provide: ErrorService, useValue: fakeErrorService },
      ],
      imports: [
        RouterTestingModule,
      ],
    });
    router = TestBed.get(Router);
    service = TestBed.get(DirectMessageService);
    spyOn(router, 'navigate');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should navigate to channel on success', async () => {
    fakeWsService.awaitNextEvent.and.callFake(() => '123');
    await service.startPm('123');
    expect(fakeWsService.socket.emit).toHaveBeenCalledTimes(1);
    expect(fakeWsService.socket.emit).toHaveBeenCalledWith('join-or-create-dm-channel', '123');
    expect(router.navigate).toHaveBeenCalledWith([`friends/123`]);
  });
  it('should call errorMessage on fail', async () => {
    fakeWsService.awaitNextEvent.and.callFake(() => { throw new Error(); });
    await service.startPm('123');
    expect(fakeWsService.socket.emit).toHaveBeenCalledTimes(1);
    expect(fakeWsService.socket.emit).toHaveBeenCalledWith('join-or-create-dm-channel', '123');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(fakeErrorService.errorMessage.next).toHaveBeenCalled();
  });
});
