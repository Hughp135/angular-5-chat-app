import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewServerComponent } from './view-server.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { ActivatedRoute } from '@angular/router';
import { ChatChannel } from 'shared-interfaces/channel.interface';
import ChatServer from 'shared-interfaces/server.interface';
import { ApiService } from '../../services/api.service';
import { ErrorService } from '../../services/error.service';
import { MainResolver } from '../../resolvers/main-resolver.service';
import { Router } from '@angular/router';

describe('ViewServerComponent', () => {
  let component: ViewServerComponent;
  let fixture: ComponentFixture<ViewServerComponent>;
  let router: Router;
  let errorService: ErrorService;

  const channel: ChatChannel = {
    name: 'name',
    _id: '123',
    server_id: '345',
  };
  const server: ChatServer = {
    name: 'serv',
    _id: '345',
    owner_id: 'abc',
  };

  const fakeRoute = {
    data: Observable.of({
      state: {
        channel: Observable.of(channel),
        server: Observable.of(server),
      },
    }),
  };

  const apiServiceMock = {
    post: jasmine.createSpy().and.callFake(url => {
      if (url === 'leave-server/error-generic') {
        const error = { status: 500 };
        return Observable.throw(error);
      } else if (url === 'leave-server/error-with-message') {
        const error = { status: 400, error: { error: 'test' } };
        return Observable.throw(error);
      }
      return Observable.of({}).delay(1);
    }),
  };

  const resolveSpy = jasmine.createSpy();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewServerComponent],
      providers: [
        SettingsService,
        ErrorService,
        { provide: ActivatedRoute, useValue: fakeRoute },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: MainResolver, useValue: { resolve: resolveSpy } },
      ],
      imports: [
        RouterTestingModule,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.get(Router);
    spyOn(router, 'navigate');
    errorService = TestBed.get(ErrorService);
    spyOn(errorService.errorMessage, 'next').and.callThrough();
  });

  afterEach(() => {
    apiServiceMock.post.calls.reset();
    resolveSpy.calls.reset();
  });

  it('initial state', async () => {
    expect(component).toBeTruthy();
    const servr = await component.currentServerObs
      .take(1)
      .toPromise();
    const chan = await component.currentChatChannel
      .take(1)
      .toPromise();
    expect(servr).toEqual(server);
    expect(chan).toEqual(channel);
  });
  it('leaves the server and calls main resolver', async () => {
    component.leaveServer();
    expect(apiServiceMock.post).toHaveBeenCalledTimes(1);
    expect(apiServiceMock.post).toHaveBeenCalledWith('leave-server/345', {});
    await new Promise(res => setTimeout(res, 1));
    expect(router.navigate).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(resolveSpy).toHaveBeenCalledTimes(1);
    expect(resolveSpy).toHaveBeenCalled();
  });
  it('leave server error with generic message', async () => {
    component.currentServer = {
      _id: 'error-generic',
      name: 'test',
    };
    component.leaveServer();
    expect(apiServiceMock.post).toHaveBeenCalledTimes(1);
    expect(apiServiceMock.post).toHaveBeenCalledWith('leave-server/error-generic', {});
    await new Promise(res => setTimeout(res, 1));
    expect(router.navigate).not.toHaveBeenCalled();
    expect(resolveSpy).not.toHaveBeenCalled();
    expect(errorService.errorMessage.next).toHaveBeenCalledTimes(1);
  });
  it('leave server error with specific message', async () => {
    component.currentServer = {
      _id: 'error-with-message',
      name: 'test',
    };
    component.leaveServer();
    expect(apiServiceMock.post).toHaveBeenCalledTimes(1);
    expect(apiServiceMock.post).toHaveBeenCalledWith('leave-server/error-with-message', {});
    await new Promise(res => setTimeout(res, 1));
    expect(router.navigate).not.toHaveBeenCalled();
    expect(resolveSpy).not.toHaveBeenCalled();
    expect(errorService.errorMessage.next).toHaveBeenCalledTimes(1);
  });
});
