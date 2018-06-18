import { Component, OnInit } from '@angular/core';
import { SuiModal, ComponentModalConfig, ModalSize } from 'ng2-semantic-ui';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {

  constructor(
    public modal: SuiModal<void, void, void>,
    public settingsService: SettingsService,
  ) { }

  ngOnInit() {
  }

}

/* istanbul ignore next */
export class SettingsModal extends ComponentModalConfig<void, void, void> {
  constructor() {
    super(SettingsComponent);
    this.size = ModalSize.Large;
    this.isClosable = true;
  }
}
