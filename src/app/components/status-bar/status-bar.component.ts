import { Component, OnInit, OnDestroy } from '@angular/core';
import { SuiModalService } from 'ng2-semantic-ui';
import { SettingsModal } from '../modals/settings/settings.component';
import { SettingsService } from '../../services/settings.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers/app.states';
import { Me } from '../../../../shared-interfaces/user.interface';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss'],
})
export class StatusBarComponent implements OnInit, OnDestroy {
  public me: Me;
  private subscriptions: Subscription[] = [];

  constructor(
    store: Store<AppState>,
    private modalService: SuiModalService,
    public settingsService: SettingsService,
  ) {
    this.subscriptions.push(
      store.select('me').subscribe(me => this.me = me),
    );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }


  /* istanbul ignore next */
  openSettingsModal() {
    this.modalService.open(new SettingsModal());
  }
}
