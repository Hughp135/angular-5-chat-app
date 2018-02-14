import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../../../services/websocket.service';
import { AppStateService } from '../../../services/app-state.service';

@Component({
  selector: 'app-current-server',
  templateUrl: './current-server.component.html',
  styleUrls: ['./current-server.component.scss']
})
export class CurrentServerComponent implements OnInit {

  constructor(
    private wsService: WebsocketService,
    public appState: AppStateService,
  ) { }

  ngOnInit() {
  }

}
