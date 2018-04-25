import {
  Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy, ChangeDetectorRef,
  ViewChild, ElementRef,
} from '@angular/core';
import { ChatChannel, ChannelListItem } from 'shared-interfaces/channel.interface';
import { WebsocketService } from '../../services/websocket.service';
import { CreateChannelRequest } from 'shared-interfaces/channel.interface';
import ChatServer from '../../../../shared-interfaces/server.interface';
import { SettingsService } from '../../services/settings.service';
import { Router } from '@angular/router';
import { ChannelSettingsService } from '../../services/channel-settings.service';
import { Subscription } from 'rxjs/Subscription';
import { Me } from 'shared-interfaces/user.interface';
import { SuiModalService } from 'ng2-semantic-ui';
import { ConfirmModal } from '../modals/confirm-modal/confirm-modal.component';
import { VoiceChannel } from '../../../../shared-interfaces/voice-channel.interface';

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
  @Input() currentVoiceChannel: VoiceChannel;
  @Input() currentServer: ChatServer;
  @Input() me: Me;

  @ViewChild('textChannelInput') public textChannelInput: ElementRef;

  constructor(
    private wsService: WebsocketService,
    public settingsService: SettingsService,
    private channelSettings: ChannelSettingsService,
    private router: Router,
    private ref: ChangeDetectorRef,
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

  async joinVoiceChannel(channel: VoiceChannel) {
    this.wsService.socket.emit('join-voice-channel', channel._id);
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
    this.wsService.socket.emit('delete-channel', id);
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
