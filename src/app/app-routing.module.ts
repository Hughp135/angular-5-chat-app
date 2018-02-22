import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainComponent } from './components/main/main.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuardService } from './services/auth-guard.service';
import { RegisterComponent } from './components/register/register.component';
import { ViewServerComponent } from './components/view-server/view-server.component';
import { HomeComponent } from './components/home/home.component';

export const appRoutes: Routes = [
  {
    path: 'channels', component: MainComponent, canActivate: [AuthGuardService],
    children: [
      {
        path: ':id', component: ViewServerComponent
      },
      {
        path: '', component: HomeComponent
      },
    ],
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'server', component: MainComponent, canActivate: [AuthGuardService] },
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes),
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
