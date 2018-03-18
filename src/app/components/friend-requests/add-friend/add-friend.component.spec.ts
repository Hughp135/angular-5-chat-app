import {
  async,
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AddFriendComponent } from './add-friend.component';
import { ApiService } from '../../../services/api.service';
import { SuiModal } from 'ng2-semantic-ui';
import { Observable } from 'rxjs/Observable';

describe('AddFriendComponent', () => {
  let component: AddFriendComponent;
  let fixture: ComponentFixture<AddFriendComponent>;
  const apiServiceMock = {
    get: jasmine.createSpy().and.callFake(url => {
      if (url === 'users/userfound') {
        return Observable.of({
          user: { username: 'foundUser', _id: '123' },
        });
      } else if (url === 'users/notfound') {
        const error = { status: 404 };
        return Observable.throw(error);
      } else if (url === 'users/unauthorized') {
        const error = { status: 401 };
        return Observable.throw(error);
      } else if (url === 'users/500') {
        const error = { status: 500 };
        return Observable.throw(error);
      } else if (url === 'users/slow') {
        return Observable.of({}).delay(500);
      }
    }),
  };
  const fakeModalService = {
    approve: jasmine.createSpy(),
  };

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [AddFriendComponent],
        providers: [
          { provide: SuiModal, useValue: fakeModalService },
          { provide: ApiService, useValue: apiServiceMock },
        ],
        imports: [ReactiveFormsModule, FormsModule],
        schemas: [NO_ERRORS_SCHEMA],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFriendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    jasmine.clock().install();
  });

  afterEach(() => {
    apiServiceMock.get.calls.reset();
    fakeModalService.approve.calls.reset();
    jasmine.clock().uninstall();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('confirming add friend should approve modal with userToAdd id', () => {
    component.userToAdd = { _id: '123', username: 'test' };
    component.confirmAddFriend();
    expect(fakeModalService.approve).toHaveBeenCalledTimes(1);
  });
  it('input changes should make request after debounce time', () => {
    component.form.controls.username.setValue('userfound');
    expect(apiServiceMock.get).not.toHaveBeenCalled();
    jasmine.clock().tick(1000);
    expect(apiServiceMock.get).toHaveBeenCalledTimes(1);
  });
  it('loading should be true while making request', () => {
    component.form.controls.username.setValue('slow');
    jasmine.clock().tick(1000);
    expect(component.loading).toEqual(true);
  });
  it('should not make request if username is empty', () => {
    component.searchForUser();
    expect(apiServiceMock.get).not.toHaveBeenCalled();
  });
  it('userToAdd should be set if user was found', () => {
    component.form.controls.username.setValue('userfound');
    jasmine.clock().tick(1000);
    expect(component.userToAdd).toBeDefined();
    expect(component.userToAdd).toEqual({ username: 'foundUser', _id: '123' });
    expect(component.loading).toEqual(false);
  });
  it('error should be set if response status is 404', () => {
    component.form.controls.username.setValue('notfound');
    jasmine.clock().tick(1005);
    expect(component.userToAdd).toEqual(null);
    expect(component.error).toEqual(
      'No user was found with that username. Sure it\'s spelled right? :P',
    );
    expect(component.loading).toEqual(false);
  });
  it('error should be set if response status is 401', () => {
    component.form.controls.username.setValue('unauthorized');
    jasmine.clock().tick(1005);
    expect(component.userToAdd).toEqual(null);
    expect(component.error).toEqual(
      'You are not logged in. Please try re-logging in.',
    );
    expect(component.loading).toEqual(false);
  });
  it('error should be set if response status is anything other than 404/401', () => {
    component.form.controls.username.setValue('500');
    jasmine.clock().tick(1005);
    expect(component.userToAdd).toEqual(null);
    expect(component.error).toEqual('Something went wrong. Please try again.');
    expect(component.loading).toEqual(false);
  });
});
