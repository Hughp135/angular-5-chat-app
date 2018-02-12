import { AppStateService } from '..//app-state.service';
import { ChannelList } from 'shared-interfaces/channel.interface';

export function addEventHandlers(socket: any, appState: AppStateService) {
  socket.on('channel-list', (channels: ChannelList) => {
    appState.updateChannelsList(channels);
  });
}
