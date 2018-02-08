import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { WebsocketService } from '../../services/websocket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  public submitting = false;
  public loginForm: FormGroup;
  public error: string;

  constructor(private fb: FormBuilder,
    private apiService: ApiService,
    private wsService: WebsocketService,
    private router: Router) {
    this.createForm();
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
        const connected = await this.wsService.connect().toPromise();
        const error = !connected && {
          error: {
            error: 'Unable to establish a connection.',
          },
        };
        this.onRequestComplete(error);
        if (connected) {
          this.router.navigate(['/']);
        }
      }, e => this.onRequestComplete(e));
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
