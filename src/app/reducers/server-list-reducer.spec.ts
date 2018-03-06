import { serverListReducer, ADD_SERVER_TO_LIST } from './server-list.reducer';
import ChatServer from 'shared-interfaces/server.interface';

describe('server list reducer', () => {
  it('ADD_SERVER_TO_LIST', () => {
    const initialList: ChatServer[] = [
      {
        name: 'first server',
        _id: 'asd',
      },
      {
        name: '2nd server',
        _id: 'dfg',
      }
    ];
    const action: { type: string, payload: ChatServer } = {
      type: ADD_SERVER_TO_LIST,
      payload: {
        name: 'new server here',
        _id: '123',
      }
    };
    const state = serverListReducer(initialList, action);
    expect(state).toEqual([
      ...initialList,
      action.payload,
    ]);
  });
});
