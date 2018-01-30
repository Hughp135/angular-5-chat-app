import { Component } from '@angular/core';
import { MainComponent } from './main/main.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public loggedIn = false;

  constructor(private titleService: Title) {
    this.titleService.setTitle('Angular 5 Chat App');
  }
}
