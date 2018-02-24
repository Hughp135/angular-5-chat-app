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

describe('ViewServerComponent', () => {
  let component: ViewServerComponent;
  let fixture: ComponentFixture<ViewServerComponent>;

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

  const route = {
    data: Observable.of({
      state: {
        channel: Observable.of(channel),
        server: Observable.of(server),
      }
    })
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewServerComponent],
      providers: [
        SettingsService,
        { provide: ActivatedRoute, useValue: route },
      ],
      imports: [
        RouterTestingModule
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('initial state', async () => {
    expect(component).toBeTruthy();
    const servr = await component.currentServer
      .take(1)
      .toPromise();
    const chan = await component.currentChatChannel
      .take(1)
      .toPromise();
    expect(servr).toEqual(server);
    expect(chan).toEqual(channel);
  });
});
