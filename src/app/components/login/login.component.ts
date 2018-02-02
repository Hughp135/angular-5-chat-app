import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  public submitting = false;
  public loginForm: FormGroup;
  public error: string = null;

  constructor(private fb: FormBuilder, private apiService: ApiService) {
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
      .finally(() => {
        this.submitting = false;
      })
      .subscribe((data) => {
      }, e => {
        this.error = (e.error && e.error.error)
          ? e.error.error
          : 'Sorry, a server error occured. Please try again.';
      });
  }
}
