import { Component, OnInit, OnDestroy } from '@angular/core';
import { SuiModal, ComponentModalConfig, ModalSize } from 'ng2-semantic-ui';
import { SettingsService } from '../../../services/settings.service';
import { AudioDeviceService } from '../../../services/audio-device.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  public outputDevices: Array<MediaDeviceInfo>;
  public inputDevices: Array<MediaDeviceInfo>;
  private subscriptions: Subscription[] = [];

  constructor(
    public modal: SuiModal<void, void, void>,
    public settingsService: SettingsService,
    audioDeviceService: AudioDeviceService,
  ) {
    audioDeviceService.outputDevices.subscribe(d => this.outputDevices = d);
    audioDeviceService.inputDevices.subscribe(d => this.inputDevices = d);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
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
