import { Me } from 'shared-interfaces/user.interface';

export const SET_ME = 'SET_ME';

export function meReducer(
  state: Me,
  action,
) {
  switch (action.type) {
    case SET_ME:
      return action.payload;
    default:
      return state;
  }
}
