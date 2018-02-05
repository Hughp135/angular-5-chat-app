import * as mongoose from 'mongoose';

const serverSchema = new mongoose.Schema({
  name: { type: String, required: true, index: { unique: true } },
  owner_id: { type: mongoose.Schema.Types.ObjectId, required: true },
});

serverSchema.pre('save', async function (next) {
  /* istanbul ignore next */
  if (!this.isNew) {
    // Only check newly created channels
    return next();
  }
  const server = this;
  const otherServer = await this.constructor.findOne({
    owner_id: server.owner_id
  }).lean();

  if (otherServer) {
    const error = new Error('Owner already has a server');
    return next(error);
  }
  next();
});

const Server = mongoose.model('Server', serverSchema);

export default Server;
