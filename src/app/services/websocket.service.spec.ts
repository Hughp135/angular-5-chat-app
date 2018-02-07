import { TestBed, getTestBed } from '@angular/core/testing';

import { WebsocketService } from './websocket.service';
import { SocketIO, Server } from 'mock-socket';
import { Router } from '@angular/router';

// tslint:disable:no-unused-expression

describe('WebsocketService', () => {
  let injector: TestBed;
  let service: WebsocketService;
  let mockServer: Server;
  (window as any).MockSocketIo = SocketIO;
  const router  = {
    navigate: jasmine.createSpy()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WebsocketService,
        { provide: Router, useValue: router }
      ],
    });
    injector = getTestBed();
    service = injector.get(WebsocketService);
    mockServer = new Server('http://localhost:6145');

    // mockServer.on('connection', server => {
    //   mockServer.emit('message', 'Hi');
    // });
  });
  afterEach(() => {
    mockServer.close();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.connected).toEqual(false);
    expect(service.socket).toBeUndefined;
  });
  it('connects to websocket and redirects to /', (done) => {
    service.connect();
    expect(service.socket).toBeDefined();
    setTimeout(() => {
      expect(service.connected).toEqual(true);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
      done();
    }, 20);
  });
  it('connect and then disconnect from websocket', (done) => {
    service.connect();
    expect(service.socket).toBeDefined();
    setTimeout(() => {
      expect(service.connected).toEqual(true);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
      mockServer.close();
      setTimeout(() => {
        expect(service.connected).toEqual(false);
        done();
      }, 20);
    }, 20);
  });
});
