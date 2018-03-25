import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers/app.states';

import { ChatChannel } from 'shared-interfaces/channel.interface';
@Injectable()
export class ChannelSettingsService {
  private currentChatChannel: ChatChannel;
  public channelsVisited: { [key: string]: Date };

  constructor(store: Store<AppState>) {
    store.select('currentChatChannel').subscribe((channel) => {
      this.currentChatChannel = channel;
    });
    this.checkVisitedChannels();
  }

  checkVisitedChannels() {
    // Gets saved channel settings from localStorage and starts interval
    const savedChannelVisited = localStorage.getItem('channelsVisited');
    this.channelsVisited = savedChannelVisited
      ? JSON.parse(savedChannelVisited)
      : {};

    setInterval(() => {
      this.updateVisitedChannels();
    }, 1000);
  }

  updateVisitedChannels() {
    // Sets the current channels visited date to now.
    if (!this.currentChatChannel) {
      return;
    }

    this.channelsVisited = {
      ...this.channelsVisited,
      [this.currentChatChannel._id]: new Date(),
    };
    localStorage.setItem('channelsVisited', JSON.stringify(this.channelsVisited));
  }
}
