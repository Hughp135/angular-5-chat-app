import * as mongoose from 'mongoose';
import { ChannelListItem } from 'shared-interfaces/channel.interface';

const channelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    server_id: { type: mongoose.Schema.Types.ObjectId },
    user_ids: { type: [mongoose.Schema.Types.ObjectId], index: true },
    last_message: { type: Date },
    message_count: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

export const SERVER_CHANNEL = 'server-channel';
export const DM_CHANNEL = 'dm-channel';
type ChannelType = 'server-channel' | 'dm-channel';

export interface IChannelModel extends mongoose.Document {
  name: string;
  server_id?: mongoose.Schema.Types.ObjectId;
  user_ids?: mongoose.Schema.Types.ObjectId[];
  last_message?: Date;
}

channelSchema.pre('save', async function(next) {
  const _this = <any>this;
  /* istanbul ignore next */
  if (!this.isNew || !_this.server_id) {
    // Only check newly created server channels
    return next();
  }

  const otherChannel = await _this.constructor
    .findOne({ server_id: _this.server_id, name: _this.name })
    .lean();

  if (otherChannel) {
    const error = new Error('Channel/server must be unique');
    return next(error);
  }
  next();
});

channelSchema.methods.getChannelType = function(): ChannelType {
  if (this.server_id) {
    return SERVER_CHANNEL;
  } else {
    return DM_CHANNEL;
  }
};

const Channel: mongoose.Model<IChannelModel> = mongoose.model<IChannelModel>(
  'Channel',
  channelSchema,
);

export default Channel;

export function channelsToChannelListItems(channels: any): ChannelListItem[] {
  return channels.map(
    (chan): ChannelListItem => {
      if (chan.server_id) {
        // SERVER CHANNEL
        return {
          _id: chan._id.toString(),
          name: chan.name,
          server_id: chan.server_id.toString(),
          last_message: chan.last_message,
        };
      } else {
        // DM CHANNEL (FRIENDS)
        return {
          _id: chan._id.toString(),
          name: chan.name,
          user_ids: chan.user_ids,
          last_message: chan.last_message,
        };
      }
    },
  );
}
