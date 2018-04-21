import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerInviteComponent } from './server-invite.component';
import { SuiModal } from 'ng2-semantic-ui';

describe('ServerInviteComponent', () => {
  let component: ServerInviteComponent;
  let fixture: ComponentFixture<ServerInviteComponent>;

  const fakeModalService = {
    approve: () => null,
    context: {
      inviteId: 'asd',
    },
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ServerInviteComponent],
      providers: [
        { provide: SuiModal, useValue: fakeModalService },
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
