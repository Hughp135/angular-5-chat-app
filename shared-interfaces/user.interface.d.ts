export interface FriendRequest {
  type: 'incoming' | 'outgoing';
  user_id: string;
}

export interface User {
  // public properties only
  username: string;
  joined_servers: string[];
  friends: string[];
  friend_requests: {
    _id: string;
    type: string;
    user_id: string;
  }[];
  socket_id: string;
}
