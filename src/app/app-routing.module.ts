import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainComponent } from './components/main/main.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuardService } from './services/auth-guard.service';
import { RegisterComponent } from './components/register/register.component';
import { ViewServerComponent } from './components/view-server/view-server.component';
import { HomeComponent } from './components/home/home.component';
import { ServerResolver } from './resolvers/server-resolver.service';
import { MainResolver } from './resolvers/main-resolver.service';
import { ChatChannelComponent } from './components/chat-channel/chat-channel.component';
import { ChatChannelResolver } from './resolvers/chat-channel-resolver.service';
import { FriendsComponent } from './components/friends/friends.component';
import { FriendsResolver } from './resolvers/friends-resolver.service';
import { FriendRequestsComponent } from './components/friend-requests/friend-requests.component';
import { FriendRequestsResolver } from './resolvers/friend-requests-resolver.service';

export const appRoutes: Routes = [
  {
    path: '', component: MainComponent,
    canActivate: [AuthGuardService],
    resolve: { state: MainResolver },
    children: [
      {
        path: '', component: HomeComponent,
      },
      {
        path: 'friends', component: FriendsComponent, resolve: { state: FriendsResolver },
        children: [
          {
            path: '', component: FriendRequestsComponent,
            resolve: { unused: FriendRequestsResolver },
          },
          {
            path: ':id', component: ChatChannelComponent,
            resolve: { state: ChatChannelResolver },
          },
        ],
      },
      {
        // Unused route - no server selected
        path: 'channels', redirectTo: '/', pathMatch: 'full',
      },
      {
        path: 'channels/:id', component: ViewServerComponent,
        resolve: { state: ServerResolver },
        children: [
          {
            path: ':id', component: ChatChannelComponent,
            resolve: { state: ChatChannelResolver },
          },
        ],
      },

    ],
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, { enableTracing: false }),
  ],
  exports: [
    RouterModule,
  ],
})
export class AppRoutingModule { }
