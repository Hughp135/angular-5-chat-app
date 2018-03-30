import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import ChatServer from 'shared-interfaces/server.interface';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers/app.states';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

@Component({
  selector: 'app-server-list',
  templateUrl: './server-list.component.html',
  styleUrls: ['./server-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServerListComponent implements OnInit {
  public serverList: Observable<ChatServer[]>;
  public currentServer: Observable<ChatServer>;

  constructor(
    public settingsService: SettingsService,
    private store: Store<AppState>,
    private router: Router,
  ) {
    this.serverList = this.store.select('serverList');
    this.currentServer = this.store.select('currentServer');
  }

  joinServer(server: ChatServer) {
    this.router.navigate([`channels/${server._id}`]);
  }

  ngOnInit() {
  }

}
