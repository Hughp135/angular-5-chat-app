import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { SuiModule } from 'ng2-semantic-ui';
import { MainComponent } from './main/main.component';
import { LoginComponent } from './login/login.component';
import { SettingsService } from './services/settings.service';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
  ],
  providers: [SettingsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
