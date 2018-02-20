import { currentServerReducer, JOIN_SERVER, SET_CHANNEL_LIST, SERVER_SET_USER_LIST } from './current-server.reducer';
import ChatServer, { ServerUserList } from 'shared-interfaces/server.interface';
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
  it('SERVER_SET_USER_LIST with correct server ID', () => {
    const action: { type: string, payload: ServerUserList } = {
      type: SERVER_SET_USER_LIST,
      payload: {
        server_id: '345',
        users: [{
          username: 'dsofa',
          _id: 'df0g9su23',
          online: true,
        }]
      }
    };
    const state = currentServerReducer({ _id: '345', name: 'sdf1' }, action);
    expect(state).toEqual({ ...state, userList: action.payload });
  });
  it('SERVER_SET_USER_LIST fails with incorrect server ID', () => {
    const action: { type: string, payload: ServerUserList } = {
      type: SERVER_SET_USER_LIST,
      payload: {
        server_id: 'fg34g',
        users: [{
          username: 'dsofa',
          _id: 'df0g9su23',
          online: true,
        }]
      }
    };
    const state = currentServerReducer({ _id: '345', name: 'sdf1' }, action);
    expect(state).toEqual(state);
  });
});
