import {
  currentChatChannelReducer,
  JOIN_CHANNEL,
  NEW_CHAT_MESSAGE,
  CHAT_HISTORY,
  LEAVE_CHANNEL
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
      }
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
        message: 'new msg here',
        channel_id: '123',
        username: 'john',
        user_id: '345',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    };
    const initialState: ChatChannel = {
      name: 'new server here',
      _id: '123',
      server_id: '345',
    };
    const state = currentChatChannelReducer(initialState, action);
    expect(state).toEqual({ ...initialState, messages: [action.payload] });
  });
  it('CHAT_HISTORY - added with correct channel_id', () => {
    const action: { type: string, payload: { messages: ChatMessage[], channel_id: string } } = {
      type: CHAT_HISTORY,
      payload: {
        channel_id: '123',
        messages: [{
          message: 'new msg here',
          channel_id: '123',
          username: 'john',
          user_id: '345',
          createdAt: new Date(),
          updatedAt: new Date(),
        }]
      }
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
          message: 'new msg here',
          channel_id: '123',
          username: 'john',
          user_id: '345',
          createdAt: new Date(),
          updatedAt: new Date(),
        }]
      }
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
        messages: [secondMessage, fourthMessage]
      }
    };
    const initialState: ChatChannel = {
      name: 'new server here',
      _id: '123',
      server_id: '345',
      messages: [firstMessage, thirdMessage]
    };
    const state = currentChatChannelReducer(initialState, action);
    const resultMsgs = [fourthMessage, thirdMessage, secondMessage, firstMessage];
    expect(state).toEqual({ ...initialState, messages: resultMsgs });
  });
});
