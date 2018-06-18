import { Component, OnInit } from '@angular/core';
import { SuiModalService } from 'ng2-semantic-ui';
import { SettingsModal } from '../modals/settings/settings.component';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss'],
})
export class StatusBarComponent implements OnInit {

  constructor(
    private modalService: SuiModalService,
    public settingsService: SettingsService,
  ) { }

  ngOnInit() {
  }


  /* istanbul ignore next */
  openSettingsModal() {
    this.modalService.open(new SettingsModal());
  }
}
