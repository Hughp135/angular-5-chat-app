import { Component, OnInit } from '@angular/core';
import { SuiModalService } from 'ng2-semantic-ui/dist';
import { CreateServerModal } from '../modals/create-server/create-server.component';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-server-sidebar',
  templateUrl: './server-sidebar.component.html',
  styleUrls: ['./server-sidebar.component.scss']
})
export class ServerSidebarComponent implements OnInit {

  constructor(
    private modalService: SuiModalService,
    public appState: AppStateService,
  ) { }

  ngOnInit() {
  }

  /* istanbul ignore next */
  openCreateServerModal() {
    this.modalService.open(new CreateServerModal())
      .onApprove(() => {
      })
      .onDeny(() => {
      });
  }

}
