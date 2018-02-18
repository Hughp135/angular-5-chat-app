import { currentServerReducer, JOIN_SERVER, SET_CHANNEL_LIST } from './current-server.reducer';
import ChatServer from 'shared-interfaces/server.interface';
import { ChannelList } from '../../../shared-interfaces/channel.interface';

describe('reducers/current-server', () => {
  it('JOIN_SERVER', () => {
    const action: { type: string, payload: ChatServer } = {
      type: JOIN_SERVER,
      payload: {
        name: 'srvname',
        _id: 's802fj',
      },
    };
    const state = currentServerReducer(undefined, action);
    expect(state).toEqual(action.payload);
  });
  it('SET_CHANNEL_LIST with correct server_id', () => {
    const initialState = {
      _id: 'ga0dgj2',
      name: 'gfg2jsdf',
    };
    const action: { type: string, payload: ChannelList } = {
      type: SET_CHANNEL_LIST,
      payload: {
        server_id: 'ga0dgj2',
        channels: [],
      },
    };
    const state = currentServerReducer(initialState, action);
    expect(state).toEqual({ ...initialState, channelList: action.payload });
  });
  it('SET_CHANNEL_LIST fails with incorrect server_id', () => {
    const initialState = {
      _id: 'ga0dgj2',
      name: 'gfg2jsdf',
    };
    const action: { type: string, payload: ChannelList } = {
      type: SET_CHANNEL_LIST,
      payload: {
        server_id: 'fsdg34g',
        channels: [],
      },
    };
    const state = currentServerReducer(initialState, action);
    expect(state).toEqual(initialState);
  });
});
