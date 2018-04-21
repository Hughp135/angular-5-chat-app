import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinServerComponent } from './join-server.component';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from '../../services/api.service';
import { MainResolver } from '../../resolvers/main-resolver.service';
import { Router } from '@angular/router';

describe('JoinServerComponent', () => {
  let component: JoinServerComponent;
  let fixture: ComponentFixture<JoinServerComponent>;

  const server = {
    name: 'testServer',
    _id: 'serverId',
    invite_id: 'inviteId',
  };

  const fakeRoute = {
    data: Observable.of({
      state: {
        server,
      },
    }),
  };
  let router: Router;

  const apiServiceMock = {
    post: jasmine.createSpy().and.callFake(url => {
      if (url === 'join-server/inviteId') {
        return Observable.of({});
      } else if (url === 'join-server/notfound') {
        return Observable.throw({ status: 404 });
      }
    }),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [JoinServerComponent],
      providers: [
        { provide: ActivatedRoute, useValue: fakeRoute },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: MainResolver, useValue: { resolve: async () => { } } },
      ],
      imports: [RouterTestingModule],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.get(Router);
    spyOn(router, 'navigate');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('joining server navigates to server url on success', async () => {
    await component.joinServer();
    expect(component.loading).toEqual(false);
    expect(router.navigate)
    .toHaveBeenCalledWith([`/channels/${component.server._id}`]);
  });
  it('join server api call fails, show error', async () => {
    component.server.invite_id = 'notfound';
    await component.joinServer();
    expect(component.loading).toEqual(false);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.error).toEqual('Failed to join server. Please try again later');
    component.server.invite_id = 'inviteId'; // HACK: reset back to initial value
  });
  it('main resolver fails, show error', async () => {
    const mainResolver = TestBed.get(MainResolver);
    spyOn(mainResolver, 'resolve').and.throwError('testError');
    await component.joinServer();
    expect(mainResolver.resolve).toHaveBeenCalled();
    expect(component.loading).toEqual(false);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.error).toEqual('Failed to join server. Please try again later');
  });
});
