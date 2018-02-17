import { Component, OnInit } from '@angular/core';
import { AppStateService } from '../../../services/app-state.service';

@Component({
  selector: 'app-current-server',
  templateUrl: './current-server.component.html',
  styleUrls: ['./current-server.component.scss']
})
export class CurrentServerComponent implements OnInit {

  constructor(
    public appState: AppStateService,
  ) { }

  ngOnInit() {
  }

}
