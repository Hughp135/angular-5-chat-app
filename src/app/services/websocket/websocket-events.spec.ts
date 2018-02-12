import { addEventHandlers } from './websocket-events';
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
  it('create-channel', () => {
    spyOn(appState, 'updateChannelsList');
    addEventHandlers(fakeSocket, appState);
    expect(appState.updateChannelsList).toHaveBeenCalledWith(result);
  });
});
