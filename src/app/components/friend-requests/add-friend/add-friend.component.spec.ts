import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFriendComponent } from './add-friend.component';
import { ApiService } from '../../../services/api.service';

describe('AddFriendComponent', () => {
  let component: AddFriendComponent;
  let fixture: ComponentFixture<AddFriendComponent>;
  const apiServiceMock = {
    get: jasmine.createSpy(),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddFriendComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceMock },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFriendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    apiServiceMock.get.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
