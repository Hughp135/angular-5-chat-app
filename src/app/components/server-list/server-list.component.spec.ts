import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { StoreModule, Store } from '@ngrx/store';
import { ServerListComponent } from './server-list.component';
import { SettingsService } from '../../services/settings.service';
import { ApiService } from '../../services/api.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WebsocketService } from '../../services/websocket.service';
import ChatServer from 'shared-interfaces/server.interface';
import { reducers } from '../../reducers/reducers';
import { AppState } from '../../reducers/app.states';
import { UPDATE_SERVER_LIST } from '../../reducers/server-list.reducer';
import { JOIN_SERVER } from '../../reducers/current-server.reducer';
import { LEAVE_CHANNEL } from '../../reducers/current-chat-channel.reducer';

describe('ServerListComponent', () => {
  let component: ServerListComponent;
  let fixture: ComponentFixture<ServerListComponent>;
  let injector: TestBed;
  let apiService: ApiService;
  let httpMock: HttpTestingController;
  let store: Store<AppState>;

  const fakeWebSocketService = {
    socket: {
      emit: jasmine.createSpy()
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ServerListComponent],
      providers: [
        SettingsService,
        ApiService,
        { provide: WebsocketService, useValue: fakeWebSocketService },
      ],
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot(reducers),
      ],
    })
      .compileComponents();
    injector = getTestBed();
    apiService = injector.get(ApiService);
    httpMock = injector.get(HttpTestingController);
    store = injector.get(Store);

    spyOn(store, 'dispatch').and.callThrough();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });
  it('request server list succeeds', () => {
    const mockResponse: { servers: ChatServer[] } = {
      servers: [{ name: 'server1', _id: '123', owner_id: '345' }]
    };
    const called = httpMock.expectOne(`${apiService.BASE_URL}servers`);
    called.flush(mockResponse);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: UPDATE_SERVER_LIST,
      payload: mockResponse.servers,
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: LEAVE_CHANNEL,
      payload: null,
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: JOIN_SERVER,
      payload: mockResponse.servers[0],
    });
    component.serverList.subscribe(data => {
      expect(data).toBe(mockResponse.servers);
    });
    expect(component.loading).toEqual(false);
    expect(component.error).toEqual(null);
    httpMock.verify();
  });
  it('request succeds with empty server list', () => {
    const mockResponse: { servers: ChatServer[] } = {
      servers: []
    };
    const called = httpMock.expectOne(`${apiService.BASE_URL}servers`);
    called.flush(mockResponse);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: UPDATE_SERVER_LIST,
      payload: mockResponse.servers,
    });
    expect(store.dispatch).not.toHaveBeenCalledWith({
      type: LEAVE_CHANNEL,
      payload: null,
    });
    expect(store.dispatch).not.toHaveBeenCalledWith({
      type: JOIN_SERVER,
      payload: undefined,
    });
    component.serverList.subscribe(data => {
      expect(data).toBe(mockResponse.servers);
    });
    expect(component.loading).toEqual(false);
    expect(component.error).toEqual(null);
    httpMock.verify();
  });
  it('request server list fails', () => {
    const mockResponse: { servers: ChatServer[] } = {
      servers: [{ name: 'server1', _id: '123', owner_id: '345' }]
    };
    const called = httpMock.expectOne(`${apiService.BASE_URL}servers`);
    called.flush(mockResponse, { status: 500, statusText: 'Server Error' });
    expect(store.dispatch).not.toHaveBeenCalled();
    component.serverList.subscribe(data => {
      expect(data.length).toBe(0);
    });
    expect(component.loading).toEqual(false);
    expect(component.error).toEqual('Unable to retrieve server list.');
    httpMock.verify();
  });
  it('joins server', () => {
    const server: ChatServer = {
      name: 'test-server',
      _id: '12345',
      owner_id: 'asd123',
    };
    component.joinServer(server);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: JOIN_SERVER,
      payload: server,
    });
    expect(fakeWebSocketService.socket.emit)
      .toHaveBeenCalledWith('join-server', server._id);
  });
});
