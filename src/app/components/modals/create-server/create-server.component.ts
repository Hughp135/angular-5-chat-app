import { Component, OnInit } from '@angular/core';
import { SuiModal, ComponentModalConfig, ModalSize } from 'ng2-semantic-ui';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-create-server',
  templateUrl: './create-server.component.html',
  styleUrls: ['./create-server.component.scss']
})
export class CreateServerComponent implements OnInit {
  public form: FormGroup;
  public error: string = undefined;
  public loading = false;

  constructor(
    public modal: SuiModal<void, void>,
    private fb: FormBuilder,
    private apiService: ApiService,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.minLength(3), Validators.required]]
    });
  }

  ngOnInit() {
  }

  createServer() {
    if (!this.form.valid) {
      this.error = 'Please enter a server name first.';
      return;
    }
    this.error = undefined;
    this.loading = true;
    this.apiService
      .post('servers', this.form.value)
      .subscribe(async (data: any) => {
        this.modal.approve(undefined);
        this.loading = false;
      }, e => {
        this.loading = false;
        if (e.error && e.error.error) {
          this.error = e.error.error;
        } else {
          this.error = 'A server error occured.';
        }
      });
  }

}

/* istanbul ignore next */
export class CreateServerModal extends ComponentModalConfig<void, void, void> {
  constructor() {
    super(CreateServerComponent);

    this.size = ModalSize.Tiny;
  }
}
