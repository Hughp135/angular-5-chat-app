export default async function canJoinServer(user: any, server_id: string) {
  if (!user.joined_servers.includes(server_id.toString())) {
    return false;
  }

  return true;
}
