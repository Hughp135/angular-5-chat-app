import { Component, OnInit } from '@angular/core';
import { SuiModal, ComponentModalConfig, ModalSize } from 'ng2-semantic-ui';

export interface IConfirmModalContext {
  title: string;
  question: string;
  confirmButtonClass: string;
  confirmButtonText: string;
}

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
})
export class ConfirmModalComponent implements OnInit {

  constructor(public modal: SuiModal<IConfirmModalContext, void, void>) { }


  ngOnInit() { }
}

/* istanbul ignore next */
export class ConfirmModal extends ComponentModalConfig<IConfirmModalContext, void, void> {
  constructor(
    title: string,
    question: string,
    confirmButtonClass: string,
    confirmButtonText: string,
    size = ModalSize.Small,
  ) {
    super(ConfirmModalComponent, {
      title,
      question,
      confirmButtonClass,
      confirmButtonText,
    });

    this.isClosable = true;
    this.transitionDuration = 200;
    this.size = size;
  }
}
