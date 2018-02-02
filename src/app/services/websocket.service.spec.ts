import { TestBed, getTestBed } from '@angular/core/testing';

import { WebsocketService } from './websocket.service';
import { SocketIO, Server } from 'mock-socket';

// tslint:disable:no-unused-expression

describe('WebsocketService', () => {
  let injector: TestBed;
  let service: WebsocketService;
  let mockServer: Server;
  (window as any).MockSocketIo = SocketIO;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WebsocketService,
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
  it('connect() connects to websocket', (done) => {
    service.connect();
    expect(service.socket).toBeDefined();
    setTimeout(() => {
      expect(service.connected).toEqual(true);
      done();
    }, 20);
  });
  it('connect and then disconnect from websocket', (done) => {
    service.connect();
    expect(service.socket).toBeDefined();
    setTimeout(() => {
      expect(service.connected).toEqual(true);
      mockServer.close();
      setTimeout(() => {
        expect(service.connected).toEqual(false);
        done();
      }, 20);
    }, 20);
  });
  it('don\'t reconnect if socket already exists', (done) => {
    const connect = () => {
      service.connect();
    };
    connect();
    expect(service.socket).toBeDefined();
    setTimeout(() => {
      expect(service.connected).toEqual(true);
      expect(connect).toThrowError('Socket already exists');
      done();
    }, 20);
  });
});
