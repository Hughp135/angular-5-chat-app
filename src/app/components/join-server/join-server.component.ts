import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import ChatServer from 'shared-interfaces/server.interface';
import { ApiService } from '../../services/api.service';
import { MainResolver } from '../../resolvers/main-resolver.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-join-server',
  templateUrl: './join-server.component.html',
  styleUrls: ['./join-server.component.scss'],
})
export class JoinServerComponent implements OnInit {
  server: ChatServer;
  inviteExists = false;
  error: string;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private mainResolver: MainResolver,
    private router: Router,
  ) {
    this.route.data
      .subscribe(({ state }) => {
        this.server = state.server;
        this.error = state.error;
      });
  }

  ngOnInit() {
  }

  async joinServer() {
    this.loading = true;
    try {
      await this.apiService
        .post(`join-server/${this.server.invite_id}`, {})
        .toPromise();
      await this.mainResolver.resolve(this.route.snapshot);
      this.router.navigate([`/channels/${this.server._id}`]);
      this.loading = false;
    } catch (err) {
      this.loading = false;
      this.error = 'Failed to join server. Please try again later';
    }
  }

}
