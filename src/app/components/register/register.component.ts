import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import 'rxjs/add/operator/finally';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  public registerForm: FormGroup;
  public submitting = false;
  public error: string = null;

  constructor(private apiService: ApiService) {
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

  passwordsMatch(g: FormGroup) {
    return g.controls['password'].value === g.controls['password_confirm'].value
      ? null : { 'mismatch': true };
  }

}
