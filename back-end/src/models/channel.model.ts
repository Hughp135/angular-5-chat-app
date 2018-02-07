import * as mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  server_id: { type: mongoose.Schema.Types.ObjectId, required: true },
});

channelSchema.pre('save', async function (next) {
  /* istanbul ignore next */
  if (!this.isNew) {
    // Only check newly created channels
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

const ChannelModel = mongoose.model('Channel', channelSchema);

export default ChannelModel;
