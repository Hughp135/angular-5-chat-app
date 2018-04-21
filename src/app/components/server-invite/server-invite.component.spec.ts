import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerInviteComponent } from './server-invite.component';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';

describe('ServerInviteComponent', () => {
  let component: ServerInviteComponent;
  let fixture: ComponentFixture<ServerInviteComponent>;
  const fakeRoute = {
    data: Observable.of({
      state: {
        server: Observable.of({ name: 'testServer' }),
      },
    }),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServerInviteComponent ],
      providers: [
        { provide: ActivatedRoute, useValue: fakeRoute },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerInviteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
