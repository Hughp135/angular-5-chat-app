import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateServerComponent } from './create-server.component';

import { SuiModal } from 'ng2-semantic-ui';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

fdescribe('CreateServerComponent', () => {
  let component: CreateServerComponent;
  let fixture: ComponentFixture<CreateServerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateServerComponent],
      providers: [
        { provide: SuiModal, useValue: {} }
      ],
      imports: [
        ReactiveFormsModule,
        FormsModule
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
