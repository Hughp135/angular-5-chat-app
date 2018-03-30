import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
// import { StoreDevtoolsModule } from '@ngrx/store-devtools';
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
import { ServerResolver } from './resolvers/server-resolver.service';
import { MainResolver } from './resolvers/main-resolver.service';
import { ChatChannelResolver } from './resolvers/chat-channel-resolver.service';
import { FriendsComponent } from './components/friends/friends.component';
import { FriendsResolver } from './resolvers/friends-resolver.service';
import { DirectMessageService } from './services/direct-message.service';
import { ImageCropperComponent } from './components/image-cropper/image-cropper.component';
import { FriendRequestService } from './services/friend-request.service';
import { FriendRequestsComponent } from './components/friend-requests/friend-requests.component';
import { FriendRequestsResolver } from './resolvers/friend-requests-resolver.service';
import { AddFriendComponent } from './components/friend-requests/add-friend/add-friend.component';
import { AutofocusDirective } from './directives/autofocus.directive';
import { DmchannelListComponent } from './components/friends/dmchannel-list/dmchannel-list.component';
import { ChannelSettingsService } from './services/channel-settings.service';

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
    FriendsComponent,
    ImageCropperComponent,
    FriendRequestsComponent,
    AddFriendComponent,
    AutofocusDirective,
    DmchannelListComponent,
  ],
  entryComponents: [
    CreateServerComponent,
    AddFriendComponent,
  ],
  imports: [
    SuiModule,
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    StoreModule.forRoot(reducers),
    // StoreDevtoolsModule.instrument({
    //   maxAge: 10,
    // }),
    ShContextMenuModule,
  ],
  providers: [
    SettingsService,
    ChannelSettingsService,
    AuthGuardService,
    ApiService,
    WebsocketService,
    AppStateService,
    ErrorService,
    ServerResolver,
    MainResolver,
    ChatChannelResolver,
    FriendsResolver,
    FriendRequestsResolver,
    DirectMessageService,
    FriendRequestService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
