import { sendFriendRequest, handler as sendFriendRequestHandler } from './friend-request';
import { handler as getFriendRequests } from './get-friend-requests';
import User from '../../models/user.model';
import * as sinon from 'sinon';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as mongoose from 'mongoose';
import * as chaiAsPromised from 'chai-as-promised';
import createFakeSocketEvent from '../test_helpers/fake-socket';

const expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('friends/', async () => {
  let user1, user2, user3;
  const result = sinon.spy();
  let fakeIoConnected, socketId2EmitSpy;

  before(async () => {
    await mongoose.connect('mongodb://localhost/myapp-test');
  });
  beforeEach(async () => {
    user1 = await User.create({
      username: 'testuser1',
      password: '123456',
      socket_id: 'socketId1',
    });
    user2 = await User.create({
      username: 'testuser2',
      password: '123456',
      socket_id: 'socketId2',
    });
    user3 = await User.create({
      username: 'testuser3',
      password: '123456',
      friend_requests: [
        { type: 'incoming', user_id: user1._id },
        { type: 'outgoing', user_id: user2._id },
      ],
      socket_id: 'offlineid',
    });
    socketId2EmitSpy = sinon.spy();
    fakeIoConnected = {
      of: () => ({
        connected: {
          socketId2: { emit: socketId2EmitSpy },
        },
      }),
    };
  });
  after(async () => {
    await mongoose.connection.close();
  });
  afterEach(async () => {
    await User.remove({});
    result.resetHistory();
  });

  describe('friend-requests', () => {
    it('sends error event if fromUser not found', (done) => {
      const objectId = mongoose.Types.ObjectId();
      const { io, socket } = createFakeSocketEvent('send-friend-request', objectId,
        { user_id: '123456781234567812345678' }, onComplete, result);

      sendFriendRequest(io);
      function onComplete() {
        expect(socket.error).to.have.been
          .calledWith('Invalid token');
        done();
      }
    });
    it('emits soft-error if toUser not found', (done) => {
      const objectId = mongoose.Types.ObjectId();
      const { io, socket } = createFakeSocketEvent('send-friend-request', objectId,
        { user_id: user1._id.toString() }, onComplete, result);

      sendFriendRequest(io);
      function onComplete() {
        expect(result).to.have.been
          .calledWith('soft-error', 'User not found.');
        done();
      }
    });
    it('emits soft-error if toUser and fromUser are same', (done) => {
      const objectId = mongoose.Types.ObjectId();
      const { io, socket } = createFakeSocketEvent('send-friend-request', user1._id.toString(),
        { user_id: user1._id.toString() }, onComplete, result);

      sendFriendRequest(io);
      function onComplete() {
        expect(result).to.have.been
          .calledWith('soft-error', 'You cannot friend yourself.');
        done();
      }
    });
    it('saves friend_requests to users', async () => {
      const socket = {
        claim: { user_id: user1._id.toString() },
        emit: () => { },
      };

      await sendFriendRequestHandler(fakeIoConnected, socket, user2._id.toString());
      const fromUser: any = await User.findById(user1._id).lean();
      const toUser: any = await User.findById(user2._id).lean();

      expect(fromUser.friend_requests).to.have.lengthOf(1);
      expect(fromUser.friend_requests[0].type).to.equal('outgoing');
      expect(fromUser.friend_requests[0].user_id.toString()).to.equal(user2._id.toString());

      expect(toUser.friend_requests).to.have.lengthOf(1);
      expect(toUser.friend_requests[0].type).to.equal('incoming');
      expect(toUser.friend_requests[0].user_id.toString()).to.equal(user1._id.toString());
    });
    it('emits "sent-friend-request" to fromUser', async () => {
      const socket = {
        claim: { user_id: user1._id.toString() },
        emit: sinon.spy(),
      };

      await sendFriendRequestHandler(fakeIoConnected, socket, user2._id.toString());
      expect(socket.emit).to.have.been.calledWith('sent-friend-request');
    });
    it('emits "friend-requests" to toUser', async () => {
      const socket = {
        claim: { user_id: user1._id.toString() },
        emit: () => { },
      };

      await sendFriendRequestHandler(fakeIoConnected, socket, user2._id.toString());
      // tslint:disable-next-line:no-unused-expression
      expect(socketId2EmitSpy).to.have.been.calledOnce;
      expect(socketId2EmitSpy).to.have.been.calledWith('friend-requests', [
        sinon.match({
          type: 'incoming',
          user_id: user1._id.toString(),
          username: 'testuser1',
        }),
      ]);
    });
    it('sets toUser socket_id to null if user not online', async () => {
      const socket = {
        claim: { user_id: user1._id.toString() },
        emit: () => { },
      };

      await sendFriendRequestHandler(fakeIoConnected, socket, user3._id.toString());
      const user3Updated = await User.findById(user3._id);
      expect(user3Updated.socket_id).to.equal(null);
    });
    it('does not save more than 1 friend request if called twice', async () => {
      const socket = {
        claim: { user_id: user1._id.toString() },
        emit: () => { },
      };

      await sendFriendRequestHandler(fakeIoConnected, socket, user2._id.toString());
      await sendFriendRequestHandler(fakeIoConnected, socket, user2._id.toString());

      const fromUser: any = await User.findById(user1._id).lean();
      const toUser: any = await User.findById(user2._id).lean();

      expect(fromUser.friend_requests).to.have.lengthOf(1);
      expect(toUser.friend_requests).to.have.lengthOf(1);
    });
    it('does not save more than 1 friend request if called twice (opposite order)', async () => {
      const socket = {
        claim: { user_id: user2._id.toString() },
        emit: () => { },
      };

      await sendFriendRequestHandler(fakeIoConnected, socket, user1._id.toString());
      await sendFriendRequestHandler(fakeIoConnected, socket, user1._id.toString());

      const fromUser: any = await User.findById(user2._id).lean();
      const toUser: any = await User.findById(user1._id).lean();

      expect(fromUser.friend_requests).to.have.lengthOf(1);
      expect(toUser.friend_requests).to.have.lengthOf(1);
    });
  });
  it('if toUser has also made request to fromUser, add friends', async () => {
    const socket1 = {
      claim: { user_id: user1._id.toString() },
      emit: () => { },
    };
    const socket2 = {
      claim: { user_id: user2._id.toString() },
      emit: () => { },
    };

    await sendFriendRequestHandler(fakeIoConnected, socket1, user2._id.toString());
    await sendFriendRequestHandler(fakeIoConnected, socket2, user1._id.toString());

    const fromUser: any = await User.findById(user2._id).lean();
    const toUser: any = await User.findById(user1._id).lean();

    expect(fromUser.friend_requests).to.have.lengthOf(0);
    expect(toUser.friend_requests).to.have.lengthOf(0);
    expect(fromUser.friends).to.have.lengthOf(1);
    expect(toUser.friends).to.have.lengthOf(1);
  });
  it('after adding friends, send friends (server-user-lists) to fromUser', async () => {
    const socketId1EmitSpy = sinon.spy();
    const socket1 = {
      claim: { user_id: user1._id.toString() },
      emit: () => { },
    };
    const socket2 = {
      claim: { user_id: user2._id.toString() },
      emit: sinon.spy(),
    };

    await sendFriendRequestHandler(fakeIoConnected, socket1, user2._id.toString());
    await sendFriendRequestHandler(fakeIoConnected, socket2, user1._id.toString());

    expect(socket2.emit).to.have.been.calledWith('server-user-list', {
      server_id: 'friends',
      users: [
        { _id: user1._id, online: false, username: user1.username },
      ],
    });
  });
  it('after adding friends, send friends (server-user-lists) to toUser', async () => {
    const socketId1EmitSpy = sinon.spy();
    const fakeIo = {
      of: () => ({
        connected: {
          socketId2: { emit: () => { } },
          socketId1: { emit: socketId1EmitSpy },
        },
      }),
    };
    const socket1 = {
      claim: { user_id: user1._id.toString() },
      emit: () => { },
    };
    const socket2 = {
      claim: { user_id: user2._id.toString() },
      emit: () => { },
    };

    await sendFriendRequestHandler(fakeIo, socket1, user2._id.toString());
    await sendFriendRequestHandler(fakeIo, socket2, user1._id.toString());

    expect(socketId1EmitSpy).to.have.been.calledWith('server-user-list', {
      server_id: 'friends',
      users: [
        { _id: user2._id, online: true, username: user2.username },
      ],
    });
  });
  it('if already friends do not create friend requests', async () => {
    user1.friends = [user2._id];
    await user1.save();
    const socket1 = {
      claim: { user_id: user1._id.toString() },
      emit: () => { },
    };

    await sendFriendRequestHandler(fakeIoConnected, socket1, user2._id.toString());

    const fromUser: any = await User.findById(user2._id).lean();
    const toUser: any = await User.findById(user1._id).lean();
    expect(fromUser.friend_requests).to.have.lengthOf(0);
    expect(toUser.friend_requests).to.have.lengthOf(0);
  });
  it('do not make users friends if same user sends request twice', async () => {
    const socket1 = {
      claim: { user_id: user1._id.toString() },
      emit: () => { },
    };

    await sendFriendRequestHandler(fakeIoConnected, socket1, user2._id.toString());
    await sendFriendRequestHandler(fakeIoConnected, socket1, user2._id.toString());

    const fromUser: any = await User.findById(user2._id).lean();
    const toUser: any = await User.findById(user1._id).lean();

    expect(fromUser.friends).to.have.lengthOf(0);
  });
  describe('get-friend-requests', () => {
    it('throws and errors socket if user not found', async () => {
      const socket = {
        claim: { user_id: mongoose.Types.ObjectId() },
        error: sinon.spy(),
      };

      await expect(getFriendRequests(socket)).to.be
        .rejectedWith('User not found with id ' + socket.claim.user_id);
      expect(socket.error).to.have.been
        .calledWith('Invalid token');
    });
    it('emits "friend-requests" to user', async () => {
      const socket = {
        claim: { user_id: user3._id.toString() },
        emit: sinon.spy(),
      };

      await getFriendRequests(socket);
      expect(socket.emit).to.have.been
        .calledWith('friend-requests', [
          sinon.match({ type: 'incoming', user_id: user1._id.toString(), username: user1.username }),
          sinon.match({ type: 'outgoing', user_id: user2._id.toString(), username: user2.username }),
        ]);
    });
  });
});
