import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { WebsocketService } from '../../services/websocket.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  public submitting = false;
  public loginForm: FormGroup;
  public error: string;
  public redirectTo: string;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private wsService: WebsocketService,
    private router: Router,
    route: ActivatedRoute,
  ) {
    this.createForm();
    route.params.subscribe(params => {
      this.redirectTo = params.redirect;
    });
  }

  createForm() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  submitForm() {
    this.submitting = true;
    this.error = null;
    this.apiService
      .post('login', this.loginForm.value)
      .subscribe(async (data: any) => {
        const error = await this.connectToSocket();
        this.onRequestComplete(error);
      }, e => this.onRequestComplete(e));
  }

  async connectToSocket() {
    const connected = await this.wsService.connect().toPromise();
    if (connected) {
      await this.router.navigate([this.redirectTo || '/']);
    }
    return !connected && {
      error: {
        error: 'Unable to establish a connection.',
      },
    };
  }

  onRequestComplete(e?) {
    this.submitting = false;

    if (e) {
      this.error = (e.error && e.error.error)
        ? e.error.error
        : 'Sorry, a server error occured. Please try again.';
      return;
    }
  }
}
