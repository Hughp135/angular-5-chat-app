import * as mongoose from 'mongoose';

const voiceChannelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    server_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  {
    timestamps: true,
  });


export interface IVoiceChannelModel extends mongoose.Document {
  name: string;
  server_id?: mongoose.Schema.Types.ObjectId;
}

// voiceChannelSchema.pre('save', async function (next) {
//   /* istanbul ignore next */
//   if (!this.isNew || !this.server_id) {
//     // Only check newly created server channels
//     return next();
//   }
//   const channel = this;
//   const otherChannel = await this.constructor.findOne({
//     server_id: channel.server_id,
//     name: channel.name,
//   }).lean();


//   if (otherChannel) {
//     const error = new Error('Channel/server must be unique');
//     return next(error);
//   }
//   next();
// });

const VoiceChannel: mongoose.Model<IVoiceChannelModel>
  = mongoose.model<IVoiceChannelModel>('VoiceChannel', voiceChannelSchema);

export default VoiceChannel;
