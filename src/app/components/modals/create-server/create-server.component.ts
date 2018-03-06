import { Component, OnInit } from '@angular/core';
import { SuiModal, ComponentModalConfig, ModalSize } from 'ng2-semantic-ui';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../../reducers/app.states';
import ChatServer from 'shared-interfaces/server.interface';
import { ADD_SERVER_TO_LIST } from '../../../reducers/server-list.reducer';

@Component({
  selector: 'app-create-server',
  templateUrl: './create-server.component.html',
  styleUrls: ['./create-server.component.scss'],
})
export class CreateServerComponent implements OnInit {
  public form: FormGroup;
  public error: string = undefined;
  public loading = false;
  public cropperImgSrc: string;

  constructor(
    public modal: SuiModal<void, void>,
    private fb: FormBuilder,
    private apiService: ApiService,
    private store: Store<AppState>,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.minLength(3), Validators.required]],
      icon: null,
    });
  }

  ngOnInit() {
  }

  onFileChange(event) {
    const reader = new FileReader();
    this.cropperImgSrc = null;
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.cropperImgSrc = reader.result;
      };
    }
  }

  setIconField(dataUrl: string) {
    if (dataUrl && dataUrl.startsWith('data:image/jpeg;base64')) {
      this.form.get('icon').setValue(dataUrl.split(',')[1]);
    } else {
      this.form.get('icon').setValue(null);
    }
  }

  async createServer() {
    if (!this.form.valid) {
      this.error = 'Please enter a server name first.';
      return;
    }
    this.error = undefined;
    this.loading = true;
    try {
      const { server }: { server: ChatServer } = <any>await this.apiService
        .post('servers', this.form.value)
        .toPromise();
      this.modal.approve(undefined);
      this.loading = false;
      this.store.dispatch({
        type: ADD_SERVER_TO_LIST,
        payload: server,
      });
    } catch (e) {
      this.loading = false;
      if (e.error && e.error.error) {
        this.error = e.error.error;
      } else {
        this.error = 'A server error occured.';

      }
    }
  }

}

/* istanbul ignore next */
export class CreateServerModal extends ComponentModalConfig<void, void, void> {
  constructor() {
    super(CreateServerComponent);
    this.mustScroll = true;
    this.size = ModalSize.Small;
  }
}
