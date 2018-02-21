import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ServerSidebarComponent } from './server-sidebar.component';
import { SuiModalService, SuiComponentFactory } from 'ng2-semantic-ui/dist';

describe('ServerSidebarComponent', () => {
  let component: ServerSidebarComponent;
  let fixture: ComponentFixture<ServerSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ServerSidebarComponent],
      providers: [SuiModalService, SuiComponentFactory],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
