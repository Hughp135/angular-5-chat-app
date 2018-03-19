import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ChatChannel } from 'shared-interfaces/channel.interface';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers/app.states';

@Injectable()
export class SettingsService {
  public invertedThemeSubj = new BehaviorSubject(false);
  private currentChatChannel: ChatChannel;
  public channelsVisited: { [key: string]: Date };

  constructor(private store: Store<AppState>) {
    store.select('currentChatChannel').subscribe((channel) => {
      this.currentChatChannel = channel;
    });
    this.checkVisitedChannels();
  }

  set invertedTheme(enabled: boolean) {
    this.invertedThemeSubj.next(enabled);
  }

  get invertedTheme() {
    return this.invertedThemeSubj.getValue();
  }

  checkVisitedChannels() {
    const savedChannelVisited = localStorage.getItem('channelsVisited');
    this.channelsVisited = savedChannelVisited
      ? JSON.parse(savedChannelVisited)
      : {};

    setInterval(() => {
      this.updateVisitedChannels();
    }, 1000);
  }

  updateVisitedChannels() {
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
