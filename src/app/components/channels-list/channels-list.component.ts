import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
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
  public voiceChannelName: string;
  private subscriptions: Subscription[] = [];
  public showNewChannelInput = false;
  public showVoiceChannelInput = false;

  @Input() currentChatChannel: ChatChannel;
  @Input() currentVoiceChannel: VoiceChannel;
  @Input() currentServer: ChatServer;
  @Input() me: Me;

  @ViewChild('textChannelInput') public textChannelInput: ElementRef;
  @ViewChild('voiceChannelInput') public voiceChannelInput: ElementRef;

  constructor(
    private wsService: WebsocketService,
    public settingsService: SettingsService,
    private channelSettings: ChannelSettingsService,
    private router: Router,
    private ref: ChangeDetectorRef,
    private modalService: SuiModalService,
  ) {}

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

  voiceChannelUsers(channelId) {
    if (!this.currentServer.voiceChannelsUsers) {
      return [];
    }
    return this.currentServer.voiceChannelsUsers[channelId] || [];
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
    // lul wait for render cheat
    setTimeout(() => {
      this.textChannelInput.nativeElement.focus();
    }, 50);
  }

  showCreateVoiceChannel() {
    this.showVoiceChannelInput = true;
    // lul wait for render cheat
    setTimeout(() => {
      this.voiceChannelInput.nativeElement.focus();
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

  createVoiceChannel() {
    const channel: CreateChannelRequest = {
      server_id: this.currentServer._id,
      name: this.voiceChannelName,
    };
    this.wsService.socket.emit('create-voice-channel', channel);
    this.showVoiceChannelInput = false;
    this.voiceChannelName = '';
  }

  /* istanbul ignore next */
  showDeleteChannelConfirm(event, channel, isVoice?: boolean) {
    event.stopPropagation();
    this.modalService
      .open(
        new ConfirmModal(
          'Delete Channel',
          `Are you sure you want to delete the channel ${channel.name}?`,
          'red',
          'Delete Channel',
        ),
      )
      .onApprove(() => {
        if (isVoice) {
          this.deleteVoiceChannel(channel._id);
        } else {
          this.deleteChannel(channel._id);
        }
      })
      .onDeny(() => {});
  }

  deleteChannel(id) {
    this.wsService.socket.emit('delete-channel', id);
  }

  deleteVoiceChannel(id) {
    this.wsService.socket.emit('delete-voice-channel', id);
  }

  newChannelInputKeypress(event) {
    if (event.key === 'Escape') {
      this.showNewChannelInput = false;
      this.newChannelName = '';
    }
  }

  voiceChannelInputKeypress(event) {
    if (event.key === 'Escape') {
      this.showVoiceChannelInput = false;
      this.voiceChannelName = '';
    }
  }

  get isOwner() {
    return this.me._id === this.currentServer.owner_id;
  }
}
