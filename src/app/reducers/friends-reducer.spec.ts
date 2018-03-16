import { friendsReducer, SET_FRIEND_REQUESTS } from './friends-reducer';
import { User } from 'shared-interfaces/user.interface';

describe('friends-reducer', () => {
  it('sets friendRequests', () => {
    const action: { type: string, payload: User['friend_requests'] } = {
      type: SET_FRIEND_REQUESTS,
      payload: [{
        type: 'incoming',
        user_id: 'u1',
        _id: 's802fj',
      }],
    };
    const state = friendsReducer(undefined, action);
    expect(state).toEqual({ ...state, friendRequests: action.payload });
  });
});
