import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ShContextMenuModule } from 'ng2-right-click-menu';

import { AppRoutingModule } from './app-routing.module';
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
import { ChannelsListComponent } from './components/channels/channels-list.component';
import { AppStateService } from './services/app-state.service';
import { ErrorNotificationComponent } from './components/error-notification/error-notification.component';
import { ErrorService } from './services/error.service';
import { ChatChannelComponent } from './components/chat-channel/chat-channel.component';
import { reducers } from './reducers/reducers';
import { UserListComponent } from './components/user-list/user-list.component';
import { ServerSidebarComponent } from './components/server-sidebar/server-sidebar.component';
import { CreateServerComponent } from './components/modals/create-server/create-server.component';
import { ViewServerComponent } from './components/view-server/view-server.component';
import { HomeComponent } from './components/home/home.component';
import { ServerResolver } from './services/server-resolver.service';
import { MainResolver } from './services/main-resolver.service';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    LoginComponent,
    RegisterComponent,
    ServerListComponent,
    ChannelsListComponent,
    ErrorNotificationComponent,
    ChatChannelComponent,
    UserListComponent,
    ServerSidebarComponent,
    CreateServerComponent,
    ViewServerComponent,
    HomeComponent,
  ],
  entryComponents: [
    CreateServerComponent,
  ],
  imports: [
    SuiModule,
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    StoreModule.forRoot(reducers),
    StoreDevtoolsModule.instrument({
      maxAge: 10
    }),
    ShContextMenuModule,
  ],
  providers: [
    SettingsService,
    AuthGuardService,
    ApiService,
    WebsocketService,
    AppStateService,
    ErrorService,
    ServerResolver,
    MainResolver,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
