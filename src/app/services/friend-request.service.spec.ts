import { TestBed } from '@angular/core/testing';

import { FriendRequestService } from './friend-request.service';
import { WebsocketService } from './websocket.service';
import { ErrorService } from './error.service';

describe('FriendRequestService', () => {
  let service;
  let fakeWsService;
  let fakeErrorService;

  beforeEach(() => {
    fakeWsService = {
      socket: {
        emit: jasmine.createSpy(),
      },
      awaitNextEvent: jasmine.createSpy(),
    };
    fakeErrorService = {
      errorMessage: {
        next: jasmine.createSpy(),
      },
    };
    TestBed.configureTestingModule({
      providers: [
        FriendRequestService,
        { provide: WebsocketService, useValue: fakeWsService },
        { provide: ErrorService, useValue: fakeErrorService },
      ],
    });
    service = TestBed.get(FriendRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should emit "send-friend-requeset"', async () => {
    await (service.sendFriendRequest('123'));
    expect(fakeWsService.socket.emit).toHaveBeenCalledWith('send-friend-request', '123');
  });
  it('should emit "remove-friend"', async () => {
    await (service.removeFriend('123'));
    expect(fakeWsService.socket.emit).toHaveBeenCalledWith('remove-friend', '123');
  });
  it('should emit "reject-friend-requeset"', async () => {
    await (service.rejectFriendRequest('123'));
    expect(fakeWsService.socket.emit).toHaveBeenCalledWith('reject-friend-request', '123');
  });
  it('should succeed', async () => {
    await (service.sendFriendRequest('123'));
    fakeWsService.awaitNextEvent.and.callFake(() => { });
    expect(fakeWsService.awaitNextEvent).toHaveBeenCalledTimes(1);
    expect(fakeErrorService.errorMessage.next).not.toHaveBeenCalled();
  });
  it('should display error on fail', async () => {
    fakeWsService.awaitNextEvent.and.throwError('');
    await (service.sendFriendRequest('123'));
    expect(fakeErrorService.errorMessage.next).toHaveBeenCalledTimes(1);
  });
});
