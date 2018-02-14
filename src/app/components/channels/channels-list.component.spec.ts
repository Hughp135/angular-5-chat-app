import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelsListComponent } from './channels-list.component';

describe('ChannelsListComponent', () => {
  let component: ChannelsListComponent;
  let fixture: ComponentFixture<ChannelsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChannelsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
