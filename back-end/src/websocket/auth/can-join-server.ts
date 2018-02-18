export default async function canJoinServer(user: any, server_id: string) {
  if (!user.joinedServers.includes(server_id.toString())) {
    return false;
  }

  return true;
}
