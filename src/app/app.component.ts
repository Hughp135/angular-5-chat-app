import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { WebsocketService } from './services/websocket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public loggedIn = false;

  constructor(private titleService: Title, private wsService: WebsocketService) {
    this.titleService.setTitle('Angular 5 Chat App');
    this.wsService.connect();
  }
}
