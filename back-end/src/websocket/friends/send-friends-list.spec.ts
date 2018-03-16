import { sendFriendsUserList } from './send-friends-list';
import User from '../../models/user.model';
import * as sinon from 'sinon';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as mongoose from 'mongoose';

const expect = chai.expect;
chai.use(sinonChai);

describe('friends/send-friends-list', async () => {
  let io, socket, user1, user2, user3;

  before(async () => {
    await mongoose.connect('mongodb://localhost/myapp-test');
  });
  after(async () => {
    await mongoose.connection.close();
  });
  afterEach(async () => {
    await User.remove({});
  });

  beforeEach(async () => {
    user1 = await User.create({ username: 'user1', password: '123456' });
    user2 = await User.create({ username: 'user2', password: '123456', socket_id: 'socket1' });
    user3 = await User.create({
      username: 'user3',
      password: '123456',
      friends: [user1._id, user2._id],
    });
    io = {
      of: () => ({
        connected: {
          socket1: { claim: { user_id: user2._id } },
        },
      }),
    };
    socket = {
      emit: sinon.spy(),
    };
  });

  it('returns correct online/offline list', async () => {
    const result = await sendFriendsUserList(io, socket, user3);
    expect(socket.emit).to.have.been.calledWith('server-user-list', {
      server_id: 'friends',
      users: [
        { _id: user1._id, username: 'user1', online: false },
        { _id: user2._id, username: 'user2', online: true },
      ],
    });
  });

});
