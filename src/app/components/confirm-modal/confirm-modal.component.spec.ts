import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmModalComponent, IConfirmModalContext } from './confirm-modal.component';
import { SuiModal } from 'ng2-semantic-ui';

describe('ConfirmModalComponent', () => {
  let component: ConfirmModalComponent;
  let fixture: ComponentFixture<ConfirmModalComponent>;
  const modalContext: IConfirmModalContext = {
    title: 'Title',
    question: 'test?',
    confirmButtonClass: 'test',
    confirmButtonText: 'confirm',
  };
  const fakeModalService = {
    approve: () => null,
    context: modalContext,
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmModalComponent],
      providers: [
        { provide: SuiModal, useValue: fakeModalService },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('context', () => {
    expect(component.modal.context).toEqual({
      title: 'Title',
      question: 'test?',
      confirmButtonClass: 'test',
      confirmButtonText: 'confirm',
    });
  });
});
