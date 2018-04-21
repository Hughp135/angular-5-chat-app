import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { WebsocketService } from '../../services/websocket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  public registerForm: FormGroup;
  public submitting = false;
  public error: string = null;
  public success = false;

  constructor(
    private apiService: ApiService,
    private wsService: WebsocketService,
    private router: Router,
  ) {
    this.createForm();
  }

  createForm() {
    this.registerForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.minLength(3)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      password_confirm: new FormControl('', [Validators.required, Validators.minLength(6)]),
    }, this.passwordsMatch);
  }

  submitForm() {
    this.submitting = true;
    this.error = null;
    this.apiService
      .post('register', this.registerForm.value)
      .subscribe(async () => {
        this.success = true;
        const error = await this.connectToSocket();
        this.onRequestComplete(error);
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

  async connectToSocket() {
    // await new Promise(res => setTimeout(res, 2500));
    const connected = await this.wsService.connect().toPromise();
    if (connected) {
      await this.router.navigate(['/']);
      return;
    }

    return {
      error: {
        error: 'Your account was created but logging in failed. Please try logging in manually.',
      },
    };
  }

  passwordsMatch(g: FormGroup) {
    return g.controls['password'].value === g.controls['password_confirm'].value
      ? null : { 'mismatch': true };
  }

}
