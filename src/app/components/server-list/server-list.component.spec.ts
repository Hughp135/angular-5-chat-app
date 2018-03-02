import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { StoreModule, Store } from '@ngrx/store';
import { ServerListComponent } from './server-list.component';
import { SettingsService } from '../../services/settings.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import ChatServer from 'shared-interfaces/server.interface';
import { reducers } from '../../reducers/reducers';
import { AppState } from '../../reducers/app.states';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { SuiModule } from 'ng2-semantic-ui';

describe('ServerListComponent', () => {
  let component: ServerListComponent;
  let fixture: ComponentFixture<ServerListComponent>;
  let injector: TestBed;
  let httpMock: HttpTestingController;
  let store: Store<AppState>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ServerListComponent],
      providers: [
        SettingsService,
      ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        StoreModule.forRoot(reducers),
        SuiModule
      ],
    })
      .compileComponents();
    injector = getTestBed();
    httpMock = injector.get(HttpTestingController);
    store = injector.get(Store);
    router = injector.get(Router);
    spyOn(router, 'navigate');
    spyOn(store, 'dispatch').and.callThrough();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
    expect(component.currentServer).toBeTruthy();
    expect(component.serverList).toBeTruthy();
  });
  it('joins server', () => {
    const server: ChatServer = {
      name: 'test-server',
      _id: '12345',
      owner_id: 'asd123',
    };
    component.joinServer(server);
    expect(router.navigate).toHaveBeenCalledWith([`channels/${server._id}`]);
  });
});
