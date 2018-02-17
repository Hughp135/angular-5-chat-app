import { ActionReducerMap } from '@ngrx/store';
import { AppState } from './app.states';
import { serverListReducer } from './server-list.reducer';
import { currentServerReducer } from './current-server.reducer';

export const reducers: ActionReducerMap<AppState> = {
  serverList: serverListReducer,
  currentServer: currentServerReducer,
  currentChannel: null,
};
