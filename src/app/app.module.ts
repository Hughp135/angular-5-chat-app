import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { appRoutes } from './app-routes';
import { AppComponent } from './app.component';
import { SuiModule } from 'ng2-semantic-ui';
import { MainComponent } from './components/main/main.component';
import { LoginComponent } from './components/login/login.component';
import { SettingsService } from './services/settings.service';
import { ApiService } from './services/api.service';
import { AuthGuardService } from './services/auth-guard.service';
import { RegisterComponent } from './components/register/register.component';
import { WebsocketService } from './services/websocket.service';
import { ServerListComponent } from './components/server-list/server-list.component';
import { ChannelsListComponent } from './components/channels/channels-list/channels-list.component';
import { AppStateService } from './services/app-state.service';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    LoginComponent,
    RegisterComponent,
    ServerListComponent,
    ChannelsListComponent,
  ],
  imports: [
    SuiModule,
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forRoot(
      appRoutes
    ),
    HttpClientModule
  ],
  providers: [
    SettingsService,
    AuthGuardService,
    ApiService,
    WebsocketService,
    AppStateService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
