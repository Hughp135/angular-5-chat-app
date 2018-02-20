import { Component, OnInit } from '@angular/core';
import { SuiModalService } from 'ng2-semantic-ui/dist';
import { CreateServerModal } from '../modals/create-server/create-server.component';

@Component({
  selector: 'app-server-sidebar',
  templateUrl: './server-sidebar.component.html',
  styleUrls: ['./server-sidebar.component.scss']
})
export class ServerSidebarComponent implements OnInit {

  constructor(private modalService: SuiModalService) { }

  ngOnInit() {
  }

  openCreateServerModal() {
    this.modalService.open(new CreateServerModal())
      .onApprove(() => {
        console.log('Approved');
      })
      .onDeny(() => {
        console.log('Modal dismissed');
      });
  }

}
