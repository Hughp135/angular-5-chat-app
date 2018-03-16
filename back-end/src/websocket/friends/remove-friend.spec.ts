import { handler } from './remove-friend';
import * as sinon from 'sinon';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as mongoose from 'mongoose';
import User from '../../models/user.model';
import { ObjectId } from 'bson';

const expect = chai.expect;

chai.use(sinonChai);

describe('websocket/friends/remove-friend', () => {
  let user1, user2, user3;
  let socket;

  before(async () => {
    await mongoose.connect('mongodb://localhost/myapp-test');
  });
  beforeEach(async () => {
    user3 = await User.create({
      username: 'testuser3',
      password: '123456',
    });
    user1 = await User.create({
      username: 'testuser1',
      password: '123456',
      socket_id: '123',
      friends: [user3._id.toString()],
    });
    user2 = await User.create({
      username: 'testuser2',
      password: '123456',
      friends: [user1._id.toString(), user3._id.toString()],
    });
    socket = {
      claim: { user_id: user2._id.toString() },
      error: sinon.spy(),
      emit: sinon.spy(),
    };
  });
  after(async () => {
    await mongoose.connection.close();
  });
  afterEach(async () => {
    socket.error.resetHistory();
    socket.emit.resetHistory();
    await User.remove({});
  });

  it('throws error if socket user not found', async () => {
    const io = {
      of: () => ({
        connected: {},
      }),
    };
    socket.claim.user_id = new ObjectId();
    await handler(io, socket, user1._id.toString());
    expect(socket.error).to.have.been.calledWith('Invalid token');
  });
  it('emits soft-error if userId is not a friend', async () => {
    const io = {
      of: () => ({
        connected: {},
      }),
    };
    socket.claim.user_id = user3._id;
    await handler(io, socket, user1._id.toString());
    expect(socket.emit).to.have.been.calledWith('soft-error', 'You are not friends with this user');
  });
  it('should remove friend on fromUser', async () => {
    const io = {
      of: () => ({
        connected: {},
      }),
    };
    await handler(io, socket, user1._id.toString());
    const updatedUser: any = await User.findById(user2._id).lean();
    expect(updatedUser.friends).to.deep.equal([user3._id.toString()]);
  });
  it('should remove friend on toUser', async () => {
    user1.friends = [user2._id.toString()];
    await user1.save();
    const io = {
      of: () => ({
        connected: {},
      }),
    };
    await handler(io, socket, user1._id.toString());
    const updatedUser: any = await User.findById(user1._id).lean();
    expect(updatedUser.friends).to.deep.equal([]);
  });
  it('should emit friends list to calling user', async () => {
    const io = {
      of: () => ({
        connected: {},
      }),
    };
    await handler(io, socket, user1._id.toString());
    await expect(socket.emit).to.have.been.calledOnce;
    expect(socket.emit).to.have.been.calledWith('server-user-list', {
      server_id: 'friends',
      users: [{ _id: user3._id, online: false, username: 'testuser3' }],
    });
  });
  it('should emit friends list to toUser if their socket is connected', async () => {
    const toUserEmitSpy = sinon.spy();
    const io = {
      of: () => ({
        connected: {
          [user1.socket_id]: {
            emit: toUserEmitSpy,
          },
        },
      }),
    };
    await handler(io, socket, user1._id.toString());
    await expect(socket.emit).to.have.been.calledOnce;
    await expect(toUserEmitSpy).to.have.been.calledOnce;
    expect(socket.emit).to.have.been.calledWith('server-user-list', {
      server_id: 'friends',
      users: [{ _id: user3._id, online: false, username: 'testuser3' }],
    });
    expect(toUserEmitSpy).to.have.been.calledWith('server-user-list', {
      server_id: 'friends',
      users: [{ _id: user3._id, online: false, username: 'testuser3' }],
    });
  });
  it('should only call User.save once if toUser does not exist', async () => {
    const io = {
      of: () => ({
        connected: {},
      }),
    };
    const objId = new ObjectId().toString();

    user2.friends = [objId];
    await user2.save();
    sinon.spy(User.prototype, 'save');
    await handler(io, socket, objId);
    await expect(User.prototype.save).to.have.been.calledOnce;
  });
});
