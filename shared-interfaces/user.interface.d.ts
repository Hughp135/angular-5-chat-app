export interface FriendRequest {
  type: 'incoming' | 'outgoing';
  user_id: string;
}

export interface User {
  // public properties only
  username: string;
  joinedServers: string[];
  friends: string[];
  friend_requests: {
    type: string;
    user_id: string;
  }[];
}
