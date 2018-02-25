import * as mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  server_id: { type: mongoose.Schema.Types.ObjectId },
  user_ids: [{ type: mongoose.Schema.Types.ObjectId }],
});

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

const Channel: mongoose.Model<IChannelModel> = mongoose.model<IChannelModel>('Channel', channelSchema);

export default Channel;
