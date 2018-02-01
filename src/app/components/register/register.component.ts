import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  public registerForm: FormGroup;

  constructor() {
    this.createForm();
  }

  createForm() {
    this.registerForm = new FormGroup({
      'username': new FormControl('', [Validators.required, Validators.minLength(3)]),
      'password': new FormControl('', [Validators.required, Validators.minLength(3)]),
      'password-confirm': new FormControl('', [Validators.required, Validators.minLength(3)]),
    }, passwordsMatch);
  }

  submitForm() {
    // todo
  }

}

function passwordsMatch(g: FormGroup) {
  return g.controls['password'].value === g.controls['password-confirm'].value
    ? null : { 'mismatch': true };
}
