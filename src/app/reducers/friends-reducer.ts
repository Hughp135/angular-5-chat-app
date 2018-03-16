import { User } from 'shared-interfaces/user.interface';

export const SET_FRIEND_REQUESTS = 'SET_FRIEND_REQUESTS';
// export const ADD_FRIEND_REQUEST = 'ADD_FRIEND_REQUEST';

export interface FriendsStore {
  friendRequests: User['friend_requests'];
}

export function friendsReducer(
  state: FriendsStore = {
    friendRequests: [],
  },
  action,
) {
  switch (action.type) {
    case SET_FRIEND_REQUESTS:
      return {
        ...state,
        friendRequests: action.payload,
      };
    // case ADD_FRIEND_REQUEST:
    //   return {
    //     ...state,
    //     friendRequests: state.friendRequests
    //       .filter(req => req._id !== action.payload._id)
    //       .push(action.payload),
    //   };
    default:
      return state;
  }
}
