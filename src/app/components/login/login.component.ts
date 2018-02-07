import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { WebsocketService } from '../../services/websocket.service';

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
    private wsService: WebsocketService) {
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
      .finally(() => this.onRequestComplete())
      .subscribe((data: any) => {
        this.wsService.connect();
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
