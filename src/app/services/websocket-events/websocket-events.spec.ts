import { handlers, CHANNEL_LIST, CHAT_MESSAGE } from './websocket-events';
import { AppStateService } from '../app-state.service';

const result = 'success';
const fakeSocket = {
  on: (msg: string, callback: any) => {
    callback(result);
  }
};

describe('websocket-events', () => {
  let appState: AppStateService;
  beforeEach(() => {
    appState = new AppStateService();
  });
  it('channel-list', () => {
    spyOn(appState, 'updateChannelsList');
    handlers[CHANNEL_LIST](fakeSocket, appState);
    expect(appState.updateChannelsList).toHaveBeenCalledWith(result);
  });
  it('chat-message', () => {
    spyOn(appState, 'addMessage');
    handlers[CHAT_MESSAGE](fakeSocket, appState);
    expect(appState.addMessage).toHaveBeenCalledWith(result);
  });
});
