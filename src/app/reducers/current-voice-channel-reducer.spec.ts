import { currentVoiceChannelReducer, SET_VOICE_CHANNEL_USERS } from './current-voice-channel-reducer';
import { VoiceChannel, VoiceChannelUser } from 'shared-interfaces/voice-channel.interface';

describe('reducers/current-server', () => {
  it('sets user list on voice channel', () => {
    const state: VoiceChannel = {
      _id: '123',
      name: 'chan1',
      users: [],
    };
    const newUsers: VoiceChannelUser[] = [
      { username: 'user1', _id: 'u1id', socket_id: 'asd123' },
    ];
    const newState = currentVoiceChannelReducer(state, {
      type: SET_VOICE_CHANNEL_USERS,
      payload: newUsers,
    });
    expect(newState.users).toEqual(newUsers);
  });
});
