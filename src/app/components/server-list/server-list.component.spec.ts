import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';

import { ServerListComponent } from './server-list.component';
import { SettingsService } from '../../services/settings.service';
import { ApiService } from '../../services/api.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('ServerListComponent', () => {
  let component: ServerListComponent;
  let fixture: ComponentFixture<ServerListComponent>;
  let injector: TestBed;
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ServerListComponent],
      providers: [SettingsService, ApiService],
      imports: [HttpClientTestingModule],
    })
      .compileComponents();
    injector = getTestBed();
    service = injector.get(ApiService);
    httpMock = injector.get(HttpTestingController);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component' , () => {
    expect(component).toBeTruthy();
  });
  it('request server list succeeds', () => {
    expect(component).toBeTruthy();
    const mockResponse = { servers: [{ name: 'server1' }] };
    const called = httpMock.expectOne(`${service.BASE_URL}server`);
    called.flush(mockResponse);
    expect(component.serverList).toEqual(mockResponse.servers);
    expect(component.loading).toEqual(false);
    expect(component.error).toEqual(null);
    httpMock.verify();
  });
  it('request server list fails', () => {
    expect(component).toBeTruthy();
    const mockResponse = { servers: [{ name: 'server1' }] };
    const called = httpMock.expectOne(`${service.BASE_URL}server`);
    called.flush(mockResponse, { status: 500, statusText: 'Server Error' });
    expect(component.serverList).toEqual(undefined);
    expect(component.loading).toEqual(false);
    expect(component.error).toEqual('Unable to retrieve server list.');
    httpMock.verify();
  });
});
