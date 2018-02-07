import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-server-list',
  templateUrl: './server-list.component.html',
  styleUrls: ['./server-list.component.scss']
})
export class ServerListComponent implements OnInit {
  public serverList;
  public loading = false;
  public error: string;

  constructor(
    private apiService: ApiService,
    private settingsService: SettingsService) {
    this.loading = true;
    this.error = null;
    this.apiService
      .get('server')
      .finally(() => this.onRequestComplete())
      .subscribe((data: any) => {
        this.serverList = data.servers;
      }, e => this.onRequestComplete(e));
  }

  onRequestComplete(e?) {
    this.loading = false;

    if (e) {
      this.error = 'Unable to retrieve server list.';
      return;
    }
  }

  get invertedTheme() {
    return this.settingsService.invertedTheme;
  }

  ngOnInit() {
  }

}
