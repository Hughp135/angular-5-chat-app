import { Component, OnInit } from '@angular/core';
import { SuiModal, ComponentModalConfig, ModalSize } from 'ng2-semantic-ui';

export interface IConfirmModalContext {
  inviteId: string;
  serverName: string;
}

@Component({
  selector: 'app-server-invite',
  templateUrl: './server-invite.component.html',
  styleUrls: ['./server-invite.component.scss'],
})
export class ServerInviteComponent implements OnInit {
  public inviteLink: string;

  constructor(
    public modal: SuiModal<IConfirmModalContext, void, void>,
  ) {
    this.inviteLink = 'http://site-url.com/' + modal.context.inviteId;
  }

  ngOnInit() {
  }

}

/* istanbul ignore next */
export class ServerInviteModal extends ComponentModalConfig<IConfirmModalContext, void, void> {
  constructor(
    serverName: string,
    inviteId: string,
  ) {
    super(ServerInviteComponent, {
      serverName,
      inviteId,
    });
    this.size = ModalSize.Tiny;
    this.isClosable = true;
  }
}
