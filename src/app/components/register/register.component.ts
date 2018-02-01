import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  public registerForm: FormGroup;

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
    this.apiService
      .post('register', this.registerForm.value)
      .subscribe((data) => {
        console.log(data);
      }, (e) => {
        console.log('error', e);
      });
  }

  passwordsMatch(g: FormGroup) {
    return g.controls['password'].value === g.controls['password_confirm'].value
      ? null : { 'mismatch': true };
  }

}
