import {
  currentServerReducer, SET_CURRENT_SERVER,
  SET_CHANNEL_LIST, SERVER_SET_USER_LIST, SERVER_UPDATE_USER_LIST, SET_CHANNEL_LAST_MESSAGE_DATE,
} from './current-server.reducer';
import ChatServer, { ServerUserList, UserListUpdate } from 'shared-interfaces/server.interface';
import { ChannelList } from 'shared-interfaces/channel.interface';

describe('reducers/current-server', () => {
  it('JOIN_SERVER', () => {
    const action: { type: string, payload: ChatServer } = {
      type: SET_CURRENT_SERVER,
      payload: {
        name: 'srvname',
        _id: 's802fj',
      },
    };
    const state = currentServerReducer(undefined, action);
    expect(state).toEqual(action.payload);
  });
  it('SET_CHANNEL_LIST succeeds with correct server_id', () => {
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
        }],
      },
    };
    const state = currentServerReducer({ _id: '345', name: 'sdf1' }, action);
    expect(state).toEqual({ ...state, userList: action.payload.users });
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
        }],
      },
    };
    const state = currentServerReducer({ _id: '345', name: 'sdf1' }, action);
    expect(state).toEqual(state);
  });
  it('SERVER_UPDATE_USER_LIST fails if currentServer userlist empty', () => {
    const action: { type: string, payload: UserListUpdate } = {
      type: SERVER_UPDATE_USER_LIST,
      payload: {
        server_id: 'sdf92j',
        user: { username: 's93fj2', _id: 'dfgj2sog9', online: true },
      },
    };
    const state = currentServerReducer({ _id: 'sdf92j', name: 'df092' }, action);
    expect(state).toEqual({
      ...state,
    });
  });
  it('SERVER_UPDATE_USER_LIST fails if currentServer id !== payload.server_id', () => {
    const action: { type: string, payload: UserListUpdate } = {
      type: SERVER_UPDATE_USER_LIST,
      payload: {
        server_id: 'sdf92j',
        user: { username: 's93fj2', _id: 'dfgj2sog9', online: true },
      },
    };
    const state = currentServerReducer({
      _id: 'sg3g09',
      name: 'df092',
      userList: [{ username: 's93fj2', _id: 'dfgj2sog9', online: false }],
    }, action);
    expect(state).toEqual({
      ...state,
    });
  });
  it('SERVER_UPDATE_USER_LIST succeeds with correct data', () => {
    const action: { type: string, payload: UserListUpdate } = {
      type: SERVER_UPDATE_USER_LIST,
      payload: {
        server_id: 'sdf92j',
        user: { username: 's93fj2', _id: 'dfgj2sog9', online: true },
      },
    };
    const state = currentServerReducer({
      _id: 'sdf92j',
      name: 'df092',
      userList: [
        { username: 's93fj2', _id: 'dfgj2sog9', online: false },
        { username: 'sgsfg3', _id: 'idfg092', online: false },
      ],
    }, action);
    expect(state).toEqual({
      ...state,
      userList: [
        { username: 's93fj2', _id: 'dfgj2sog9', online: true },
        { username: 'sgsfg3', _id: 'idfg092', online: false },
      ],
    });
  });
  it('SET_CHANNEL_LAST_MESSAGE_DATE sets last date of message channel', () => {
    const action = {
      type: SET_CHANNEL_LAST_MESSAGE_DATE,
      payload: {
        id: '123',
      },
    };
    const oldDate = new Date();
    oldDate.setFullYear(1990);
    const state = {
      name: 'serv',
      _id: 'dfgw4',
      channelList: {
        server_id: 'serv',
        channels: [
          { _id: '123', name: 'chan1', last_message: oldDate },
        ],
      },
    };
    const newDate = new Date();
    expect(currentServerReducer(state, action))
      .toEqual({
        ...state,
        channelList: {
          ...state.channelList,
          channels: [
            { _id: '123', name: 'chan1', last_message: newDate },
          ],
        },
      });
  });
  it('SET_CHANNEL_LAST_MESSAGE_DATE returns original state if channel not found', () => {
    const action = {
      type: SET_CHANNEL_LAST_MESSAGE_DATE,
      payload: {
        id: 'notfound',
      },
    };
    const oldDate = new Date();
    oldDate.setFullYear(1990);
    const state = {
      name: 'serv',
      _id: 'dfgw4',
      channelList: {
        server_id: 'serv',
        channels: [
          { _id: '123', name: 'chan1', last_message: oldDate },
        ],
      },
    };
    expect(currentServerReducer(state, action))
      .toEqual(state);
  });
  it('SET_CHANNEL_LAST_MESSAGE_DATE returns undefined if currentServer is undefined', () => {
    const action = {
      type: SET_CHANNEL_LAST_MESSAGE_DATE,
      payload: {
        id: '123',
      },
    };
    const oldDate = new Date();
    oldDate.setFullYear(1990);
    expect(currentServerReducer(undefined, action))
      .toBeUndefined();
  });
});
