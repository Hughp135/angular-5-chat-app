import {
  Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy, ChangeDetectorRef,
  ViewChild, ElementRef,
} from '@angular/core';
import { ChatChannel, ChannelListItem, ChannelList } from 'shared-interfaces/channel.interface';
import { WebsocketService } from '../../services/websocket.service';
import { CreateChannelRequest } from 'shared-interfaces/channel.interface';
import ChatServer from '../../../../shared-interfaces/server.interface';
import { SettingsService } from '../../services/settings.service';
import { Router } from '@angular/router';
import { ChannelSettingsService } from '../../services/channel-settings.service';
import { Subscription } from 'rxjs/Subscription';
import { Me } from 'shared-interfaces/user.interface';
import { ApiService } from '../../services/api.service';
import { ErrorService, ErrorNotification } from '../../services/error.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers/app.states';
import { SET_CHANNEL_LIST } from '../../reducers/current-server.reducer';
import { SuiModalService } from 'ng2-semantic-ui';
import { ConfirmModal } from '../confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-channels-list',
  templateUrl: './channels-list.component.html',
  styleUrls: ['./channels-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChannelsListComponent implements OnInit, OnDestroy {
  public newChannelName: string;
  private subscriptions: Subscription[] = [];
  public showNewChannelInput = false;

  @Input() currentChatChannel: ChatChannel;
  @Input() currentServer: ChatServer;
  @Input() me: Me;

  @ViewChild('textChannelInput') public textChannelInput: ElementRef;

  constructor(
    private wsService: WebsocketService,
    public settingsService: SettingsService,
    private channelSettings: ChannelSettingsService,
    private router: Router,
    private ref: ChangeDetectorRef,
    private apiService: ApiService,
    private errorService: ErrorService,
    private store: Store<AppState>,
    private modalService: SuiModalService,
  ) {
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

  get channelList() {
    return this.currentServer.channelList;
  }

  joinChannel(channel: ChannelListItem) {
    this.router.navigate([`channels/${channel.server_id}/${channel._id}`]);
  }

  channelHasUnreadMessages(channel: ChannelListItem) {
    if (this.currentChatChannel && this.currentChatChannel._id === channel._id) {
      return false;
    }

    const channelVisited = this.channelSettings.channelsVisited[channel._id];
    const lastCheckedTime = channelVisited ? new Date(channelVisited).getTime() : 0;
    const messageDate = new Date(channel.last_message).getTime();

    return messageDate > lastCheckedTime;
  }

  showCreateTextChannel() {
    this.showNewChannelInput = true;
    setTimeout(() => {
      this.textChannelInput.nativeElement.focus();
    }, 50);
  }

  createChannel() {
    const channel: CreateChannelRequest = {
      server_id: this.currentServer._id,
      name: this.newChannelName,
    };
    this.wsService.socket.emit('create-channel', channel);
    this.showNewChannelInput = false;
    this.newChannelName = '';
  }

  /* istanbul ignore next */
  showDeleteChannelConfirm(channel) {
    this.modalService
      .open(new ConfirmModal(
        'Delete Channel',
        `Are you sure you want to delete the channel ${channel.name}?`,
        'red',
        'Delete Channel',
      ))
      .onApprove(() => this.deleteChannel(channel._id))
      .onDeny(() => { });
  }

  deleteChannel(id) {
    this.apiService.delete(`delete-channel/${id}`)
      .subscribe((channelList: ChannelList) => {
        this.store.dispatch({
          type: SET_CHANNEL_LIST,
          payload: channelList,
        });
        if (channelList.channels.length) {
          // Join first channel in list
          this.router.navigate([`channels/${this.currentServer._id}/${channelList.channels[0]._id}`]);
        }
      },
      err => {
        const errMessage = err.status === 401
          ? 'You do not have permission to delete this channel'
          : 'An error occured while trying to delete the channel';
        this.errorService.errorMessage.next(new ErrorNotification(errMessage, 5000));
      });
  }

  newChannelInputKeypress(event) {
    if (event.key === 'Escape') {
      this.showNewChannelInput = false;
      this.newChannelName = '';
    }
  }

  get isOwner() {
    return this.me._id === this.currentServer.owner_id;
  }
}
