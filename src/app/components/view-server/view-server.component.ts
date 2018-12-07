import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import ChatServer from 'shared-interfaces/server.interface';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute } from '@angular/router';
import { ChatChannel } from 'shared-interfaces/channel.interface';
import { ApiService } from '../../services/api.service';
import { ErrorService, ErrorNotification } from '../../services/error.service';
import { Router } from '@angular/router';
import { MainResolver } from '../../resolvers/main-resolver.service';
import { Me } from 'shared-interfaces/user.interface';
import { SuiModalService } from 'ng2-semantic-ui';
import { ConfirmModal } from '../modals/confirm-modal/confirm-modal.component';
import { ServerInviteModal } from '../modals/server-invite/server-invite.component';
import { VoiceChannel } from '../../../../shared-interfaces/voice-channel.interface';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-view-server',
  templateUrl: './view-server.component.html',
  styleUrls: ['./view-server.component.scss', '../../styles/layout.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ViewServerComponent implements OnInit, OnDestroy {
  public currentServerObs: Observable<ChatServer>;
  public currentServer: ChatServer;
  public currentChatChannel: Observable<ChatChannel>;
  public currentVoiceChannel: Observable<VoiceChannel>;
  public me: Me;
  public serverDropdownOpen = false;
  private subscriptions: Subscription[] = [];

  constructor(
    public settingsService: SettingsService,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private errorService: ErrorService,
    private router: Router,
    private mainResolver: MainResolver,
    private modalService: SuiModalService,
    private ref: ChangeDetectorRef,
  ) {
    this.route.data.subscribe(data => {
      this.currentServerObs = data.state.server;
      this.currentChatChannel = data.state.channel;
      this.currentVoiceChannel = data.state.voiceChannel;
      data.state.server.subscribe(server => {
        this.currentServer = server;
      });
      data.state.me.subscribe(me => (this.me = me));
    });
  }

  ngOnInit() {
    this.subscriptions.push(
      this.settingsService.invertedThemeSubj.subscribe(val => {
        this.ref.detectChanges();
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public onRightClickServerTitle(event) {
    event.preventDefault();
    this.serverDropdownOpen = true;
  }

  /* istanbul ignore next */
  showLeaveServerConfirm() {
    this.modalService
      .open(
        new ConfirmModal(
          'Leave Server',
          'Are you sure you want to leave this server?',
          'red',
          'Leave Server',
        ),
      )
      .onApprove(() => this.leaveServer())
      .onDeny(() => {});
  }

  leaveServer() {
    this.apiService.post(`leave-server/${this.currentServer._id}`, {}).subscribe(
      data => {
        this.router.navigate(['/']);
        this.mainResolver.resolve(this.route.snapshot);
      },
      response => {
        const error = response.error ? response.error.error : 'Unable to leave server.';
        this.errorService.errorMessage.next(new ErrorNotification(error, 5000));
      },
    );
  }

  /* istanbul ignore next */
  showDeleteServerConfirm() {
    this.modalService
      .open(
        new ConfirmModal(
          'Delete Server',
          'Are you sure you want to delete this server? This is permanent.',
          'red',
          'Delete Server',
        ),
      )
      .onApprove(() => this.deleteServer())
      .onDeny(() => {});
  }

  deleteServer() {
    this.apiService.delete(`delete-server/${this.currentServer._id}`, {}).subscribe(
      data => {
        this.router.navigate(['/']);
        this.mainResolver.resolve(this.route.snapshot);
      },
      response => {
        const error =
          response.error && response.error.error
            ? response.error.error
            : 'Failed to delete server.';
        this.errorService.errorMessage.next(new ErrorNotification(error, 5000));
      },
    );
  }

  /* istanbul ignore next */
  openServerInviteModal() {
    this.modalService.open(
      new ServerInviteModal(this.currentServer.name, this.currentServer.invite_id),
    );
  }

  get isOwner() {
    return this.me._id === this.currentServer.owner_id;
  }
}
