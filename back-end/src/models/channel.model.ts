import * as mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  server_id: { type: mongoose.Schema.Types.ObjectId },
  user_ids: { type: [mongoose.Schema.Types.ObjectId], index: true },
});

export const SERVER_CHANNEL = 'server-channel';
export const DM_CHANNEL = 'dm-channel';
type ChannelType = 'server-channel' | 'dm-channel';

export interface IChannelModel extends mongoose.Document {
  name: string;
  server_id?: mongoose.Schema.Types.ObjectId;
  user_ids?: mongoose.Schema.Types.ObjectId[];
}

channelSchema.pre('save', async function (next) {
  /* istanbul ignore next */
  if (!this.isNew || !this.server_id) {
    // Only check newly created server channels
    return next();
  }
  const channel = this;
  const otherChannel = await this.constructor.findOne({
    server_id: channel.server_id,
    name: channel.name,
  }).lean();


  if (otherChannel) {
    const error = new Error('Channel/server must be unique');
    return next(error);
  }
  next();
});

channelSchema.methods.getChannelType = function (): ChannelType {
  if (this.server_id) {
    return SERVER_CHANNEL;
  } else {
    return DM_CHANNEL;
  }
};

const Channel: mongoose.Model<IChannelModel> = mongoose.model<IChannelModel>('Channel', channelSchema);

export default Channel;
