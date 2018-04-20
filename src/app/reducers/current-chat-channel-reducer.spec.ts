import {
  currentChatChannelReducer,
  JOIN_CHANNEL,
  NEW_CHAT_MESSAGE,
  CHAT_HISTORY,
  LEAVE_CHANNEL,
  APPEND_CHAT_MESSAGES,
} from './current-chat-channel.reducer';
import { ChatChannel } from '../../../shared-interfaces/channel.interface';
import { ChatMessage } from '../../../shared-interfaces/message.interface';

describe('reducers/current-chat-channel', () => {
  it('JOIN_CHANNEL', () => {
    const action: { type: string, payload: ChatChannel } = {
      type: JOIN_CHANNEL,
      payload: {
        name: 'new server here',
        _id: '123',
        server_id: '345',
      },
    };
    const state = currentChatChannelReducer(undefined, action);
    expect(state).toEqual(action.payload);
  });
  it('LEAVE_CHANNEL', () => {
    const action: { type: string, payload: ChatChannel } = {
      type: LEAVE_CHANNEL,
      payload: null,
    };
    const state = currentChatChannelReducer(undefined, action);
    expect(state).toBeUndefined();
  });
  it('NEW_CHAT_MESSAGE - message gets added to correct channel_id', () => {
    const action: { type: string, payload: ChatMessage } = {
      type: NEW_CHAT_MESSAGE,
      payload: {
        _id: '123',
        message: 'new msg here',
        channel_id: '123',
        username: 'john',
        user_id: '345',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
    const initialState: ChatChannel = {
      name: 'new server here',
      _id: '123',
      server_id: '345',
    };
    const state = currentChatChannelReducer(initialState, action);
    expect(state).toEqual({ ...initialState, messages: [action.payload] });
  });
  it('NEW_CHAT_MESSAGE - message added to existing message', () => {
    const action: { type: string, payload: ChatMessage } = {
      type: NEW_CHAT_MESSAGE,
      payload: {
        _id: '123',
        message: 'new msg here',
        channel_id: '123',
        username: 'john',
        user_id: '345',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
    const initialState: ChatChannel = {
      name: 'new server here',
      _id: '123',
      server_id: '345',
      messages: [
        {
          _id: 'asd123',
          message: 'old msg here',
          channel_id: '123',
          username: 'john',
          user_id: '345',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };
    const state = currentChatChannelReducer(initialState, action);
    expect(state).toEqual({ ...initialState, messages: [action.payload, ...initialState.messages] });
  });
  it('NEW_CHAT_MESSAGE - messages length unchanged if over 50 messages', () => {
    const initialState: ChatChannel = {
      name: 'new server here',
      _id: '123',
      server_id: '345',
      messages: getLotsOfMessages('123'),
    };
    const action: { type: string, payload: ChatMessage } = {
      type: NEW_CHAT_MESSAGE,
      payload: {
        _id: '123',
        message: 'new msg here',
        channel_id: '123',
        username: 'john',
        user_id: '345',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    const state = currentChatChannelReducer(initialState, action);
    const state2 = currentChatChannelReducer(state, action);

    expect(state2.messages.length).toEqual(initialState.messages.length);
  });
  it('APPEND_CHAT_MESSAGE - appends messages to current', () => {
    const newMessages: ChatMessage[] = [{
      _id: 'asd345',
      username: 'test',
      message: 'hi',
      channel_id: '123',
      user_id: '345',
      createdAt: new Date(),
      updatedAt: new Date(),
    }];
    const initialState: ChatChannel = {
      name: 'new server here',
      _id: '123',
      server_id: '345',
      messages: [{
        _id: 'asd123',
        message: 'new msg here',
        channel_id: '123',
        username: 'john',
        user_id: '345',
        createdAt: new Date(),
        updatedAt: new Date(),
      }],
    };
    const action = { type: APPEND_CHAT_MESSAGES, payload: newMessages };
    const state = currentChatChannelReducer(initialState, action);
    expect(state.messages.length).toEqual(2);
  });
  it('CHAT_HISTORY - added with correct channel_id', () => {
    const action: { type: string, payload: { messages: ChatMessage[], channel_id: string } } = {
      type: CHAT_HISTORY,
      payload: {
        channel_id: '123',
        messages: [{
          _id: 'asd123',
          message: 'new msg here',
          channel_id: '123',
          username: 'john',
          user_id: '345',
          createdAt: new Date(),
          updatedAt: new Date(),
        }],
      },
    };
    const initialState: ChatChannel = {
      name: 'new server here',
      _id: '123',
      server_id: '345',
    };
    const state = currentChatChannelReducer(initialState, action);
    expect(state).toEqual({ ...initialState, messages: action.payload.messages });
  });
  it('CHAT_HISTORY - Not added with incorrect channel_id', () => {
    const action: { type: string, payload: { messages: ChatMessage[], channel_id: string } } = {
      type: CHAT_HISTORY,
      payload: {
        channel_id: '345',
        messages: [{
          _id: 'asd123',
          message: 'new msg here',
          channel_id: '123',
          username: 'john',
          user_id: '345',
          createdAt: new Date(),
          updatedAt: new Date(),
        }],
      },
    };
    const initialState: ChatChannel = {
      name: 'new server here',
      _id: '123',
      server_id: '345',
    };
    const state = currentChatChannelReducer(initialState, action);
    expect(state).toEqual(initialState);
  });
  it('CHAT_HISTORY - combined with existing messages in server and sort', () => {
    const first = new Date();
    first.setMinutes(first.getMinutes() - 15);
    const second = new Date();
    const third = new Date();
    third.setMinutes(first.getMinutes() + 15);
    const fourth = new Date();
    fourth.setMinutes(first.getMinutes() + 30);

    const createMessage = (date: Date) => ({
      _id: date.toTimeString(),
      message: 'msg here from minute ' + date.getMinutes(),
      channel_id: '123',
      username: 'asda',
      user_id: 'g34g',
      createdAt: date,
      updatedAt: date,
    });

    const firstMessage = createMessage(first);
    const secondMessage = createMessage(second);
    const thirdMessage = createMessage(third);
    const fourthMessage = createMessage(fourth);

    const action: { type: string, payload: { messages: ChatMessage[], channel_id: string } } = {
      type: CHAT_HISTORY,
      payload: {
        channel_id: '123',
        messages: [secondMessage, fourthMessage],
      },
    };
    const initialState: ChatChannel = {
      name: 'new server here',
      _id: '123',
      server_id: '345',
      messages: [firstMessage, thirdMessage],
    };
    const state = currentChatChannelReducer(initialState, action);
    const resultMsgs = [fourthMessage, thirdMessage, secondMessage, firstMessage];
    expect(state).toEqual({ ...initialState, messages: resultMsgs });
  });
});

function getLotsOfMessages(channelId) {
  const messages = [];
  for (let i = 0; i < 50; i++) {
    messages.push({
      _id: `msg-${i}`,
      message: `msg ${i} here`,
      channel_id: channelId,
      username: 'john',
      user_id: '345',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  return messages;
}
