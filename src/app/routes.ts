import { Routes } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { LoginComponent } from './components/login/login.component';
import { Injectable } from '@angular/core';
import { AuthGuardService } from './services/auth-guard.service';

const appRoutes: Routes = [
  { path: '', component: MainComponent, canActivate: [AuthGuardService] },
  { path: 'login', component: LoginComponent },
  // { path: 'register', component: LoginComponent },
];

export default appRoutes;
