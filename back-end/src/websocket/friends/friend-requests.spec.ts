import { sendFriendRequest, handler as sendFriendRequestHandler } from './friend-request';
import { handler as getFriendRequests } from './get-friend-requests';
import User from '../../models/user.model';
import * as mocha from 'mocha';
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

  before(async () => {
    await mongoose.connect('mongodb://localhost/myapp-test');
  });
  beforeEach(async () => {
    user1 = await User.create({
      username: 'testuser1',
      password: '123456'
    });
    user2 = await User.create({
      username: 'testuser2',
      password: '123456'
    });
    user3 = await User.create({
      username: 'testuser3',
      password: '123456',
      friend_requests: [
        { type: 'incoming', user_id: user1._id },
        { type: 'outgoing', user_id: user2._id }
      ],
    });
  });
  after(async () => {
    await mongoose.connection.close();
  });
  afterEach(async () => {
    await User.remove({});
    result.resetHistory();
  });

  describe('send-friends-list', () => {
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

      await sendFriendRequestHandler(socket, user2._id.toString());
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

      await sendFriendRequestHandler(socket, user2._id.toString());
      expect(socket.emit).to.have.been.calledWith('sent-friend-request');
    });
    it('does not save more than 1 friend request if called twice', async () => {
      const socket = {
        claim: { user_id: user1._id.toString() },
        emit: () => { },
      };

      await sendFriendRequestHandler(socket, user2._id.toString());
      await sendFriendRequestHandler(socket, user2._id.toString());

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

      await sendFriendRequestHandler(socket, user1._id.toString());
      await sendFriendRequestHandler(socket, user1._id.toString());

      const fromUser: any = await User.findById(user2._id).lean();
      const toUser: any = await User.findById(user1._id).lean();

      expect(fromUser.friend_requests).to.have.lengthOf(1);
      expect(toUser.friend_requests).to.have.lengthOf(1);
    });
  });
  describe.only('get-friends-list', () => {
    it('throws and errors socket if user not found', async () => {
      const socket = {
        claim: { user_id: mongoose.Types.ObjectId()},
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
        sinon.match({ type: 'incoming', user_id: user1._id }),
        sinon.match({ type: 'outgoing', user_id: user2._id }),
      ]);
    });
  });
});
