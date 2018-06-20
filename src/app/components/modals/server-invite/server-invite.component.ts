import { Component, OnInit } from '@angular/core';
import { SuiModal, ComponentModalConfig, ModalSize } from 'ng2-semantic-ui';
import { environment } from '../../../../environments/environment';
export interface IServerInviteModalContext {
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
    public modal: SuiModal<IServerInviteModalContext, void, void>,
  ) {
    this.inviteLink = `${environment.root_url}/${modal.context.inviteId}`;
  }

  ngOnInit() {
  }

}

/* istanbul ignore next */
export class ServerInviteModal extends ComponentModalConfig<IServerInviteModalContext, void, void> {
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
