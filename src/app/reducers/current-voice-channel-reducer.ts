import { VoiceChannel } from 'shared-interfaces/voice-channel.interface';

export const JOIN_VOICE_CHANNEL = 'JOIN_VOICE_CHANNEL';
export const LEAVE_VOICE_CHANNEL = 'LEAVE_VOICE_CHANNEL';
export const SET_VOICE_CHANNEL_USERS = 'SET_VOICE_CHANNEL_USERS';

export function currentVoiceChannelReducer(state: VoiceChannel, action) {
  switch (action.type) {
    case JOIN_VOICE_CHANNEL:
      return action.payload;
    case LEAVE_VOICE_CHANNEL:
      return undefined;
    case SET_VOICE_CHANNEL_USERS:
      return {
        ...state,
        users: action.payload,
      };
    default:
      return state;
  }
}
