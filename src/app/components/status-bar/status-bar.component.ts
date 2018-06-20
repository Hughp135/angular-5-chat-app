import { Component, OnInit } from '@angular/core';
import { SuiModalService } from 'ng2-semantic-ui';
import { SettingsModal } from '../modals/settings/settings.component';
import { SettingsService } from '../../services/settings.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers/app.states';
import { Me } from '../../../../shared-interfaces/user.interface';

@Component({
  selector: 'app-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss'],
})
export class StatusBarComponent implements OnInit {
  public me: Me;

  constructor(
    store: Store<AppState>,
    private modalService: SuiModalService,
    public settingsService: SettingsService,
  ) {
    store.select('me').subscribe(me => this.me = me);
  }

  ngOnInit() {
  }


  /* istanbul ignore next */
  openSettingsModal() {
    this.modalService.open(new SettingsModal());
  }
}
