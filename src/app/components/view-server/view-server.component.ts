import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import ChatServer from 'shared-interfaces/server.interface';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute } from '@angular/router';
import { ChatChannel } from 'shared-interfaces/channel.interface';
import { ApiService } from '../../services/api.service';
import { ErrorService, ErrorNotification } from '../../services/error.service';
import { Router } from '@angular/router';
import { MainResolver } from '../../resolvers/main-resolver.service';

@Component({
  selector: 'app-view-server',
  templateUrl: './view-server.component.html',
  styleUrls: ['./view-server.component.scss', '../../styles/layout.scss'],
})
export class ViewServerComponent implements OnInit {
  public currentServerObs: Observable<ChatServer>;
  public currentServer: ChatServer;
  public currentChatChannel: Observable<ChatChannel>;

  constructor(
    public settingsService: SettingsService,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private errorService: ErrorService,
    private router: Router,
    private mainResolver: MainResolver,
  ) {
    this.route.data
      .subscribe((data) => {
        this.currentServerObs = data.state.server;
        this.currentChatChannel = data.state.channel;
        data.state.server.subscribe(server => { this.currentServer = server; });
      });
  }

  ngOnInit() {
  }

  leaveServer() {
    this.apiService.post(`leave-server/${this.currentServer._id}`, {})
      .subscribe((data) => {
        this.router.navigate(['/']);
        this.mainResolver.resolve(this.route.snapshot);
      }, response => {
        const error = response.error ? response.error.error : 'Unable to leave server.';
        this.errorService.errorMessage
          .next(new ErrorNotification(error, 5000));
      });
  }
}
