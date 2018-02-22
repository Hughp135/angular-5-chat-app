import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewServerComponent } from './view-server.component';

describe('ViewServerComponent', () => {
  let component: ViewServerComponent;
  let fixture: ComponentFixture<ViewServerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewServerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
