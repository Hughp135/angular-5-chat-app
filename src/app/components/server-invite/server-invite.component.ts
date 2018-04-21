import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import ChatServer from 'shared-interfaces/server.interface';

@Component({
  selector: 'app-server-invite',
  templateUrl: './server-invite.component.html',
  styleUrls: ['./server-invite.component.scss'],
})
export class ServerInviteComponent implements OnInit {
  server: ChatServer;
  inviteExists = false;
  error: string;

  constructor(private route: ActivatedRoute) {
    this.route.data
      .subscribe(({ state }) => {
        this.server = state.server;
        this.error = state.error;
      });
  }

  ngOnInit() {
  }

}
